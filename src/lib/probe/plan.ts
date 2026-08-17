import type { DiagnosticInput } from './diagnostic';

export type DiagnosticMode = 'quick' | 'full';
export type ProbeId = 'connectivity' | 'streaming' | 'tool_calling' | 'error_hygiene' | 'usage_integrity' |
  'parameter_honoring' | 'latency_stability' | 'multi_turn' | 'structured_output' | 'event_sequence' |
  'reasoning_compatibility' | 'anthropic_events' | 'anthropic_cache' | 'logprobs';
export type ProbeDefinition = { id: ProbeId; weight: number; requests: number };

export function createProbePlan(input: Pick<DiagnosticInput, 'protocol' | 'targetTool' | 'model'> & { mode: DiagnosticMode }): ProbeDefinition[] {
  const plan: ProbeDefinition[] = [
    { id: 'connectivity', weight: 3, requests: 1 },
    { id: 'streaming', weight: 2, requests: 1 },
    { id: 'tool_calling', weight: 2, requests: 1 },
  ];
  if (input.mode === 'quick') return plan;
  plan.push(
    { id: 'error_hygiene', weight: 2, requests: 1 },
    { id: 'usage_integrity', weight: 2, requests: 2 },
    { id: 'parameter_honoring', weight: 2, requests: 2 },
    { id: 'latency_stability', weight: 1, requests: 3 },
    { id: 'multi_turn', weight: 2, requests: 2 },
  );
  if (input.protocol === 'openai_responses') plan.push(
    { id: 'event_sequence', weight: 2, requests: 1 },
    { id: 'structured_output', weight: 2, requests: 1 },
  );
  if (input.protocol === 'openai_chat') plan.push(
    { id: 'structured_output', weight: 2, requests: 1 },
    { id: 'logprobs', weight: 1, requests: 1 },
  );
  if (input.protocol === 'anthropic_messages') plan.push(
    { id: 'anthropic_events', weight: 2, requests: 1 },
    { id: 'anthropic_cache', weight: 1, requests: 2 },
  );
  if (/^(o\d|gpt-5|.*reason)/i.test(input.model)) plan.push({ id: 'reasoning_compatibility', weight: 2, requests: 1 });
  return plan;
}

export function estimatedRequests(plan: readonly ProbeDefinition[]): number {
  return plan.reduce((sum, probe) => sum + probe.requests, 0);
}
