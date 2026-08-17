import { describe, expect, it } from 'vitest';
import { publicProbeError, redactValue } from '@/lib/probe/redaction';

describe('probe redaction', () => {
  it('removes credentials from nested strings and error messages', () => {
    const secret = 'sk-radar-canary-123456789';
    const value = redactValue({
      authorization: `Bearer ${secret}`,
      detail: `request failed for key ${secret}`,
      nested: [`x-api-key=${secret}`],
    }, [secret]);
    expect(JSON.stringify(value)).not.toContain(secret);
    expect(JSON.stringify(value)).toContain('[REDACTED]');
  });

  it('returns only stable public categories', () => {
    expect(publicProbeError(new Error('socket failure at private host'))).toEqual({
      code: 'PROVIDER_UNAVAILABLE',
      message: 'The provider could not complete this test.',
    });
  });
});
