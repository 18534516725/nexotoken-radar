import { z } from 'zod';
import { publicProbeError } from './redaction';
import { normalizeEndpoint } from './endpoint';
import { createProbePlan, type DiagnosticMode } from './plan';
import { scoreDiagnostic } from '@/lib/benchmark/score';

export const diagnosticInputSchema = z.object({
  baseUrl: z.url().max(2048),
  credential: z.string().min(8).max(4096),
  model: z.string().min(1).max(255).regex(/^[A-Za-z0-9][A-Za-z0-9._:/-]*$/).refine((value) => !value.includes('..')),
  protocol: z.enum(['openai_chat', 'openai_responses', 'anthropic_messages']),
  targetTool: z.enum(['claude_code', 'codex', 'cursor', 'generic_openai', 'generic_anthropic']),
  authStyle: z.enum(['auto', 'bearer', 'x_api_key', 'anthropic']).default('auto'),
  mode: z.enum(['quick', 'full']).optional(),
});

export type DiagnosticInput = z.infer<typeof diagnosticInputSchema>;
export type ProbeKind = 'connectivity' | 'streaming' | 'tool_call';

export type TransportRequest = {
  baseUrl: string;
  path: string;
  kind: ProbeKind;
  headers: Record<string, string>;
  body: Record<string, unknown> & { stream: boolean };
};

export type TransportResponse = {
  status: number;
  headers: Record<string, string>;
  firstByteMs: number;
  totalMs: number;
  bodyPreview: string;
};

export type ProbeTransport = (request: TransportRequest) => Promise<TransportResponse>;

export type DiagnosticCheck = {
  id: 'connectivity' | 'streaming' | 'tool_calling';
  label: string;
  outcome: 'pass' | 'warn' | 'fail';
  message: string;
  firstByteMs?: number;
  totalMs?: number;
};

export type DiagnosticResult = {
  overall: 'compatible' | 'partially_compatible' | 'incompatible';
  testedAt: string;
  protocol: DiagnosticInput['protocol'];
  targetTool: DiagnosticInput['targetTool'];
  checks: DiagnosticCheck[];
  mode?: DiagnosticMode;
  score?: number;
  coverage?: number;
};

function endpointPath(protocol: DiagnosticInput['protocol']): string {
  if (protocol === 'openai_responses') return '/responses';
  if (protocol === 'anthropic_messages') return '/messages';
  return '/chat/completions';
}

function authenticationHeaders(input: DiagnosticInput): Record<string, string> {
  const style = input.authStyle === 'auto'
    ? (input.protocol === 'anthropic_messages' ? 'anthropic' : 'bearer')
    : input.authStyle;
  if (style === 'anthropic') return { 'x-api-key': input.credential, 'anthropic-version': '2023-06-01' };
  if (style === 'x_api_key') return { 'x-api-key': input.credential };
  return { authorization: `Bearer ${input.credential}` };
}

function requestBody(input: DiagnosticInput, kind: ProbeKind): TransportRequest['body'] {
  const stream = kind === 'streaming';
  const tool = { name: 'radar_probe', description: 'Return the supplied value.', parameters: { type: 'object', properties: { value: { type: 'string' } }, required: ['value'] } };

  if (input.protocol === 'openai_responses') {
    return {
      model: input.model,
      input: kind === 'tool_call' ? 'Call radar_probe with value OK.' : 'Reply with OK.',
      max_output_tokens: 24,
      stream,
      ...(kind === 'tool_call' ? { tools: [{ type: 'function', ...tool }], tool_choice: 'required' } : {}),
    };
  }
  if (input.protocol === 'anthropic_messages') {
    return {
      model: input.model,
      messages: [{ role: 'user', content: kind === 'tool_call' ? 'Use radar_probe with value OK.' : 'Reply with OK.' }],
      max_tokens: 24,
      stream,
      ...(kind === 'tool_call' ? { tools: [{ ...tool, input_schema: tool.parameters }], tool_choice: { type: 'any' } } : {}),
    };
  }
  return {
    model: input.model,
    messages: [{ role: 'user', content: kind === 'tool_call' ? 'Call radar_probe with value OK.' : 'Reply with OK.' }],
    max_tokens: 24,
    stream,
    ...(kind === 'tool_call' ? { tools: [{ type: 'function', function: tool }], tool_choice: 'required' } : {}),
  };
}

function failedCheck(id: DiagnosticCheck['id'], label: string, response: TransportResponse): DiagnosticCheck {
  const error = publicProbeError({ status: response.status });
  return { id, label, outcome: 'fail', message: error.message, firstByteMs: response.firstByteMs, totalMs: response.totalMs };
}

export async function runDiagnostic(rawInput: DiagnosticInput, transport: ProbeTransport): Promise<DiagnosticResult> {
  const input = diagnosticInputSchema.parse(rawInput);
  const mode = input.mode ?? 'quick';
  const normalizedBaseUrl = normalizeEndpoint(input.baseUrl, input.protocol);
  const common = {
    baseUrl: normalizedBaseUrl,
    path: endpointPath(input.protocol),
    headers: { 'content-type': 'application/json', ...authenticationHeaders(input) },
  };
  const checks: DiagnosticCheck[] = [];

  const connectivity = await transport({ ...common, kind: 'connectivity', body: requestBody(input, 'connectivity') });
  if (connectivity.status < 200 || connectivity.status >= 300) {
    checks.push(failedCheck('connectivity', 'Connectivity and model access', connectivity));
    return { overall: 'incompatible', testedAt: new Date().toISOString(), protocol: input.protocol, targetTool: input.targetTool, checks, mode, ...scoreForChecks(checks, mode, input) };
  }
  checks.push({ id: 'connectivity', label: 'Connectivity and model access', outcome: 'pass', message: 'The endpoint accepted the bounded model request.', firstByteMs: connectivity.firstByteMs, totalMs: connectivity.totalMs });

  const streaming = await transport({ ...common, kind: 'streaming', body: requestBody(input, 'streaming') });
  const streamType = streaming.headers['content-type']?.toLowerCase() ?? '';
  checks.push(streaming.status >= 200 && streaming.status < 300 && streamType.includes('text/event-stream')
    ? { id: 'streaming', label: 'Streaming', outcome: 'pass', message: 'The endpoint returned an SSE stream.', firstByteMs: streaming.firstByteMs, totalMs: streaming.totalMs }
    : failedCheck('streaming', 'Streaming', streaming));

  const toolCall = await transport({ ...common, kind: 'tool_call', body: requestBody(input, 'tool_call') });
  const toolObserved = /tool_calls|tool_use|function_call|response\.function_call/i.test(toolCall.bodyPreview);
  checks.push(toolCall.status >= 200 && toolCall.status < 300 && toolObserved
    ? { id: 'tool_calling', label: 'Tool calling', outcome: 'pass', message: 'The response contained a structured tool call.', firstByteMs: toolCall.firstByteMs, totalMs: toolCall.totalMs }
    : { ...failedCheck('tool_calling', 'Tool calling', toolCall), outcome: toolCall.status >= 200 && toolCall.status < 300 ? 'warn' : 'fail', message: toolCall.status >= 200 && toolCall.status < 300 ? 'The request succeeded but no structured tool call was observed.' : failedCheck('tool_calling', 'Tool calling', toolCall).message });

  const failures = checks.filter((check) => check.outcome === 'fail').length;
  const warnings = checks.filter((check) => check.outcome === 'warn').length;
  return {
    overall: failures ? 'incompatible' : warnings ? 'partially_compatible' : 'compatible',
    testedAt: new Date().toISOString(),
    protocol: input.protocol,
    targetTool: input.targetTool,
    checks,
    mode,
    ...scoreForChecks(checks, mode, input),
  };
}

function scoreForChecks(checks: DiagnosticCheck[], mode: DiagnosticMode, input: DiagnosticInput) {
  const plan = createProbePlan({ mode, protocol: input.protocol, targetTool: input.targetTool, model: input.model });
  const items = plan.map((probe) => {
    const check = checks.find((candidate) => candidate.id === probe.id);
    return { weight: probe.weight, applicable: true, outcome: check?.outcome ?? 'skipped' as const };
  });
  const score = scoreDiagnostic(items);
  return { score: score.score, coverage: score.coverage };
}
