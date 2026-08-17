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
export type ProbeKind = 'connectivity' | 'streaming' | 'tool_call' | 'error_hygiene' | 'usage_integrity' | 'parameter_honoring' | 'latency_stability' | 'multi_turn' | 'structured_output' | 'event_sequence' | 'reasoning_compatibility' | 'anthropic_events' | 'anthropic_cache' | 'logprobs';

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
  id: 'connectivity' | 'streaming' | 'tool_calling' | Exclude<import('./plan').ProbeId, 'connectivity' | 'streaming' | 'tool_calling'>;
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
  const stream = kind === 'streaming' || kind === 'event_sequence' || kind === 'anthropic_events';
  const toolRequested = kind === 'tool_call';
  const tool = { name: 'radar_probe', description: 'Return the supplied value.', parameters: { type: 'object', properties: { value: { type: 'string' } }, required: ['value'] } };

  if (input.protocol === 'openai_responses') {
    return {
      model: input.model,
      input: toolRequested ? 'Call radar_probe with value OK.' : kind === 'multi_turn' ? [{ role: 'user', content: 'Remember the code RADAR-7.' }, { role: 'user', content: 'Reply with the remembered code.' }] : 'Reply with OK.',
      max_output_tokens: 24,
      stream,
      ...(toolRequested ? { tools: [{ type: 'function', ...tool }], tool_choice: 'required' } : {}),
      ...(kind === 'structured_output' ? { text: { format: { type: 'json_schema', name: 'radar_result', strict: true, schema: { type: 'object', properties: { ok: { type: 'boolean' } }, required: ['ok'], additionalProperties: false } } } } : {}),
      ...(kind === 'reasoning_compatibility' ? { reasoning: { effort: 'low' } } : {}),
    };
  }
  if (input.protocol === 'anthropic_messages') {
    return {
      model: input.model,
      messages: [{ role: 'user', content: toolRequested ? 'Use radar_probe with value OK.' : 'Reply with OK.' }],
      max_tokens: 24,
      stream,
      ...(toolRequested ? { tools: [{ ...tool, input_schema: tool.parameters }], tool_choice: { type: 'any' } } : {}),
      ...(kind === 'anthropic_cache' ? { cache_control: { type: 'ephemeral' } } : {}),
    };
  }
  return {
    model: input.model,
    messages: [{ role: 'user', content: toolRequested ? 'Call radar_probe with value OK.' : 'Reply with OK.' }],
    max_tokens: 24,
    stream,
    ...(toolRequested ? { tools: [{ type: 'function', function: tool }], tool_choice: 'required' } : {}),
    ...(kind === 'structured_output' ? { response_format: { type: 'json_schema', json_schema: { name: 'radar_result', strict: true, schema: { type: 'object', properties: { ok: { type: 'boolean' } }, required: ['ok'], additionalProperties: false } } } } : {}),
    ...(kind === 'logprobs' ? { logprobs: true, top_logprobs: 2, temperature: 0 } : {}),
  };
}

function failedCheck(id: DiagnosticCheck['id'], label: string, response: TransportResponse): DiagnosticCheck {
  const error = publicProbeError({ status: response.status });
  return { id, label, outcome: 'fail', message: error.message, firstByteMs: response.firstByteMs, totalMs: response.totalMs };
}

function parseJson(value: string): unknown {
  try { return JSON.parse(value); } catch { return undefined; }
}

function streamEvidence(value: string): { complete: boolean; hasData: boolean } {
  const parsed = parseJson(value) as Record<string, unknown> | undefined;
  if (parsed?.status === 'completed') return { complete: true, hasData: true };
  const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const dataLines = lines.filter((line) => line.startsWith('data:'));
  const hasData = dataLines.some((line) => line.slice(5).trim() && line.slice(5).trim() !== '[DONE]');
  const complete = lines.some((line) => line === 'data: [DONE]' || /response\.completed|message_stop|message_delta/i.test(line));
  return { complete, hasData };
}

function toolEvidence(value: string): boolean {
  const parsed = parseJson(value) as Record<string, unknown> | undefined;
  // Some transports expose only a typed marker in their bounded preview.
  if (!parsed) return /function_call|tool_calls|tool_use/i.test(value);
  if (parsed.type === 'function_call' && !('name' in parsed) && !('arguments' in parsed)) return true;
  const candidates: Record<string, unknown>[] = [parsed];
  const output = parsed.output;
  if (Array.isArray(output)) candidates.push(...output.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object'));
  const choices = parsed.choices;
  if (Array.isArray(choices)) candidates.push(...choices.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object'));
  return candidates.some((candidate) => {
    const name = candidate.name ?? (candidate.function as Record<string, unknown> | undefined)?.name;
    const args = candidate.arguments ?? (candidate.function as Record<string, unknown> | undefined)?.arguments ?? candidate.input;
    if (name !== 'radar_probe' || typeof args !== 'string' && (!args || typeof args !== 'object')) return false;
    const parsedArgs = typeof args === 'string' ? parseJson(args) : args;
    return !!parsedArgs && typeof parsedArgs === 'object' && (parsedArgs as Record<string, unknown>).value === 'OK';
  });
}

function usageEvidence(value: string): boolean {
  const parsed = parseJson(value) as Record<string, unknown> | undefined;
  const usage = parsed?.usage as Record<string, unknown> | undefined;
  if (!usage) return false;
  const input = usage.prompt_tokens ?? usage.input_tokens;
  const output = usage.completion_tokens ?? usage.output_tokens;
  return Number.isFinite(Number(input)) && Number(input) >= 0 && Number.isFinite(Number(output)) && Number(output) >= 0;
}

function structuredEvidence(value: string): boolean {
  const parsed = parseJson(value) as Record<string, unknown> | undefined;
  const candidates = [parsed?.output_text, parsed?.text, parsed?.content, value];
  return candidates.some((candidate) => {
    if (typeof candidate !== 'string') return false;
    const json = parseJson(candidate) as Record<string, unknown> | undefined;
    return json?.ok === true || json?.ok === false;
  });
}

function probeLabel(id: ProbeKind): string {
  const labels: Record<string, string> = {
    error_hygiene: '错误信息安全', usage_integrity: '用量诚实性', parameter_honoring: '参数遵从',
    latency_stability: '延迟稳定性', multi_turn: '多轮对话', structured_output: '结构化输出',
    event_sequence: '事件序列', reasoning_compatibility: '推理能力兼容', anthropic_events: 'Anthropic 事件',
    anthropic_cache: '提示缓存', logprobs: 'Logprobs 数据',
  };
  return labels[id] ?? id;
}

function probeRequestBody(input: DiagnosticInput, id: ProbeKind, attempt: number): TransportRequest['body'] {
  const body = requestBody(input, id);
  if (id === 'parameter_honoring') {
    return input.protocol === 'openai_responses'
      ? { ...body, max_output_tokens: attempt === 0 ? 4 : 24, temperature: attempt === 0 ? 0 : 1 }
      : { ...body, max_tokens: attempt === 0 ? 4 : 24, temperature: attempt === 0 ? 0 : 1, top_p: attempt === 0 ? 0.2 : 1 };
  }
  if (id === 'error_hygiene') return { ...body, model: '', messages: [{ role: 'user', content: '' }] };
  return body;
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
  const stream = streamEvidence(streaming.bodyPreview);
  checks.push(streaming.status >= 200 && streaming.status < 300 && streamType.includes('text/event-stream')
    ? { id: 'streaming', label: 'Streaming', outcome: stream.hasData && stream.complete ? 'pass' : 'warn', message: stream.hasData && stream.complete ? '流式事件有数据且正常结束。' : '返回了流式响应，但未能证明事件完整结束。', firstByteMs: streaming.firstByteMs, totalMs: streaming.totalMs }
    : failedCheck('streaming', 'Streaming', streaming));

  const toolCall = await transport({ ...common, kind: 'tool_call', body: requestBody(input, 'tool_call') });
  const toolObserved = toolEvidence(toolCall.bodyPreview);
  checks.push(toolCall.status >= 200 && toolCall.status < 300 && toolObserved
    ? { id: 'tool_calling', label: 'Tool calling', outcome: 'pass', message: '检测到指定工具名及可解析的参数。', firstByteMs: toolCall.firstByteMs, totalMs: toolCall.totalMs }
    : { ...failedCheck('tool_calling', 'Tool calling', toolCall), outcome: toolCall.status >= 200 && toolCall.status < 300 ? 'warn' : 'fail', message: toolCall.status >= 200 && toolCall.status < 300 ? 'The request succeeded but no structured tool call was observed.' : failedCheck('tool_calling', 'Tool calling', toolCall).message });

  if (mode === 'full') {
    const plan = createProbePlan({ mode, protocol: input.protocol, targetTool: input.targetTool, model: input.model });
    for (const probe of plan.slice(3)) {
      const attempts = probe.id === 'latency_stability' ? 3 : probe.requests;
      const responses = await Promise.all(Array.from({ length: attempts }, (_, attempt) => transport({ ...common, kind: probe.id as ProbeKind, body: probeRequestBody(input, probe.id as ProbeKind, attempt) })));
      const response = responses[responses.length - 1]!;
      const success = responses.every((item) => item.status >= 200 && item.status < 300);
      const body = responses.map((item) => item.bodyPreview).join('\n');
      const evidence = probe.id === 'usage_integrity' ? responses.every((item) => usageEvidence(item.bodyPreview))
        : probe.id === 'event_sequence' || probe.id === 'anthropic_events' ? responses.every((item) => streamEvidence(item.bodyPreview).hasData && streamEvidence(item.bodyPreview).complete)
        : probe.id === 'structured_output' ? responses.every((item) => structuredEvidence(item.bodyPreview))
        : probe.id === 'logprobs' ? /logprobs|top_logprobs/i.test(body)
        : probe.id === 'reasoning_compatibility' ? /reasoning|thinking/i.test(body)
        : probe.id === 'multi_turn' ? /RADAR-7/i.test(body)
        : probe.id === 'anthropic_cache' ? /cache[_ -]?(read|hit|creation)|cached_tokens/i.test(body)
        : probe.id === 'latency_stability' ? latencyStable(responses.map((item) => item.totalMs))
        : false;
      const needsInterpretation = new Set(['error_hygiene', 'parameter_honoring', 'multi_turn', 'anthropic_cache']);
      const outcome = !success ? 'fail' : needsInterpretation.has(probe.id) ? 'warn' : evidence ? 'pass' : 'warn';
      const message = !success ? publicProbeError({ status: response.status }).message
        : outcome === 'pass' ? '检测到了预期的协议证据。'
        : needsInterpretation.has(probe.id) ? '请求已完成，但当前证据不足以确认该能力。'
        : '请求已完成，但没有检测到足够的专项证据。';
      checks.push({ id: probe.id, label: probeLabel(probe.id as ProbeKind), outcome, message, firstByteMs: response.firstByteMs, totalMs: response.totalMs });
    }
  }

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

function latencyStable(values: readonly number[]): boolean {
  if (values.length < 2) return false;
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return average > 0 && Math.max(...values) - Math.min(...values) <= average * 0.5;
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
