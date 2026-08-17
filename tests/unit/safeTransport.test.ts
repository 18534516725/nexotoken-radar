import { describe, expect, it } from 'vitest';
import { buildEndpointUrl } from '@/lib/probe/safeTransport';

describe('safe probe transport', () => {
  it.each([
    ['https://api.example.com/v1', '/responses', 'https://api.example.com/v1/responses'],
    ['https://api.example.com/v1/', '/chat/completions', 'https://api.example.com/v1/chat/completions'],
    ['https://api.example.com/v1/responses', '/responses', 'https://api.example.com/v1/responses'],
  ])('joins a Base URL without replacing its version path', (base, path, expected) => {
    expect(buildEndpointUrl(base, path).toString()).toBe(expected);
  });
});
