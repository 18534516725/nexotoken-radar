export function createSlidingWindowLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const events = new Map<string, number[]>();
  return {
    allow(key: string, now = Date.now()) {
      const cutoff = now - windowMs;
      const recent = (events.get(key) ?? []).filter((timestamp) => timestamp > cutoff);
      if (recent.length >= limit) {
        events.set(key, recent);
        return { allowed: false as const, retryAfterMs: Math.max(1, recent[0]! + windowMs - now) };
      }
      recent.push(now);
      events.set(key, recent);
      return { allowed: true as const, remaining: limit - recent.length };
    },
  };
}
