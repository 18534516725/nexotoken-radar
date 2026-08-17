import { describe, expect, it, vi } from 'vitest';
import { diagnosticInputSchema, runDiagnostic, type ProbeTransport } from '@/lib/probe/diagnostic';

const input = {
  baseUrl: 'https://api.example.com/v1',
  credential: 'sk-radar-canary-secret',
  model: 'coding-model',
  protocol: 'openai_responses' as const,
  targetTool: 'codex' as const,
  authStyle: 'bearer' as const,
};

describe('private API diagnostic', () => {
  it('validates the complete public input contract', () => {
    expect(diagnosticInputSchema.parse(input)).toEqual(input);
    expect(() => diagnosticInputSchema.parse({ ...input, credential: '' })).toThrow();
    expect(() => diagnosticInputSchema.parse({ ...input, model: '../private' })).toThrow();
  });

  it('runs bounded connectivity, streaming and tool checks without returning the credential', async () => {
    const transport: ProbeTransport = vi.fn(async (request) => ({
      status: 200,
      headers: { 'content-type': request.body.stream ? 'text/event-stream' : 'application/json' },
      firstByteMs: 120,
      totalMs: 240,
      bodyPreview: request.kind === 'tool_call' ? '{"type":"function_call"}' : '{"status":"completed"}',
    }));

    const result = await runDiagnostic(input, transport);
    expect(transport).toHaveBeenCalledTimes(3);
    expect(result.overall).toBe('compatible');
    expect(result.checks.map((check) => check.id)).toEqual(['connectivity', 'streaming', 'tool_calling']);
    expect(JSON.stringify(result)).not.toContain(input.credential);
  });

  it('categorizes provider errors without exposing raw response content', async () => {
    const transport: ProbeTransport = vi.fn(async () => ({
      status: 401,
      headers: { 'content-type': 'application/json' },
      firstByteMs: 80,
      totalMs: 90,
      bodyPreview: `invalid credential ${input.credential} internal route detail`,
    }));
    const result = await runDiagnostic(input, transport);
    expect(result.overall).toBe('incompatible');
    expect(result.checks[0]?.message).toBe('Authentication or model permission was rejected.');
    expect(JSON.stringify(result)).not.toContain(input.credential);
    expect(JSON.stringify(result)).not.toContain('internal route detail');
  });

  it('executes the full plan instead of stopping after the three baseline probes', async () => {
    const transport: ProbeTransport = vi.fn(async (request) => ({
      status: 200,
      headers: { 'content-type': request.body.stream ? 'text/event-stream' : 'application/json' },
      firstByteMs: 10,
      totalMs: 20,
      bodyPreview: request.kind === 'tool_call' ? '{"type":"function_call","usage":{}}' : '{"status":"completed","usage":{}}',
    }));
    const result = await runDiagnostic({ ...input, mode: 'full' }, transport);
    expect((transport as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(3);
    expect(result.checks.map((check) => check.id)).toContain('usage_integrity');
    expect(result.checks.length).toBeGreaterThan(3);
    expect(result.coverage).toBeGreaterThan(0);
  });
});
