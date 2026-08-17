import { describe, expect, it } from 'vitest';
import { normalizeEndpoint } from '@/lib/probe/endpoint';

describe('protocol endpoint normalization', () => {
  it.each([
    ['api.example.com', 'openai_responses', 'https://api.example.com/v1/responses'],
    ['https://api.example.com/v1', 'openai_chat', 'https://api.example.com/v1/chat/completions'],
    ['https://api.example.com/v1/messages', 'anthropic_messages', 'https://api.example.com/v1/messages'],
  ] as const)('normalizes %s for %s', (input, protocol, expected) => {
    expect(normalizeEndpoint(input, protocol)).toBe(expected);
  });

  it('rejects credentials and non-HTTPS schemes', () => {
    expect(() => normalizeEndpoint('http://api.example.com', 'openai_chat')).toThrow('HTTPS_REQUIRED');
    expect(() => normalizeEndpoint('https://user:pass@api.example.com', 'openai_chat')).toThrow('CREDENTIALS_NOT_ALLOWED');
  });
});
