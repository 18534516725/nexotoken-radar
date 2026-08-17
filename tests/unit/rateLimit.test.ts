import { describe, expect, it } from 'vitest';
import { createSlidingWindowLimiter } from '@/lib/rateLimit';

describe('diagnostic rate limiter', () => {
  it('limits repeated tests and recovers after the window', () => {
    const limiter = createSlidingWindowLimiter({ limit: 2, windowMs: 1_000 });
    expect(limiter.allow('visitor', 0).allowed).toBe(true);
    expect(limiter.allow('visitor', 100).allowed).toBe(true);
    expect(limiter.allow('visitor', 200).allowed).toBe(false);
    expect(limiter.allow('visitor', 1_001).allowed).toBe(true);
  });
});
