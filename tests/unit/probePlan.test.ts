import { describe, expect, it } from 'vitest';
import { createProbePlan } from '@/lib/probe/plan';

describe('dynamic probe planning', () => {
  it('keeps quick mode bounded', () => {
    const plan = createProbePlan({ mode: 'quick', protocol: 'openai_responses', targetTool: 'codex', model: 'gpt-5.6-sol' });
    expect(plan).toHaveLength(3);
    expect(plan.map((probe) => probe.id)).toEqual(['connectivity', 'streaming', 'tool_calling']);
  });

  it('adds Responses and reasoning probes in full mode', () => {
    const ids = createProbePlan({ mode: 'full', protocol: 'openai_responses', targetTool: 'codex', model: 'o3' }).map((probe) => probe.id);
    expect(ids).toContain('event_sequence');
    expect(ids).toContain('structured_output');
    expect(ids).toContain('reasoning_compatibility');
    expect(ids).not.toContain('anthropic_cache');
  });

  it('uses Anthropic-specific probes for Claude models', () => {
    const ids = createProbePlan({ mode: 'full', protocol: 'anthropic_messages', targetTool: 'claude_code', model: 'claude-sonnet-4' }).map((probe) => probe.id);
    expect(ids).toContain('anthropic_events');
    expect(ids).toContain('anthropic_cache');
    expect(ids).not.toContain('logprobs');
  });
});
