import { describe, expect, it } from 'vitest';
import { PUBLIC_ROUTES } from '@/lib/publicRoutes';

describe('public route registry', () => {
  it('covers every approved product and governance surface', () => {
    expect(PUBLIC_ROUTES.map((route) => route.path)).toEqual(expect.arrayContaining([
      '/providers', '/models', '/benchmarks', '/rankings/cheapest', '/rankings/fastest',
      '/rankings/reliable', '/rankings/most-tested', '/compatibility/claude-code',
      '/compatibility/codex', '/compatibility/cursor', '/doctor', '/submit', '/methodology',
      '/data', '/agent-doctor', '/about', '/privacy', '/terms', '/corrections', '/sponsorship',
    ]));
  });

  it('gives each route unique metadata and meaningful copy', () => {
    expect(new Set(PUBLIC_ROUTES.map((route) => route.title)).size).toBe(PUBLIC_ROUTES.length);
    for (const route of PUBLIC_ROUTES) {
      expect(route.description.length).toBeGreaterThan(60);
      expect(route.heading.length).toBeGreaterThan(8);
    }
  });
});
