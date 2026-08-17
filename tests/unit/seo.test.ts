import { describe, expect, it } from 'vitest';
import { sitemapEntries } from '@/lib/seo/discovery';

describe('discovery surface', () => {
  it('publishes the canonical decision pages', () => {
    const urls = sitemapEntries().map((entry) => entry.url);
    expect(urls).toContain('https://radar.nexotoken.net/providers');
    expect(urls).toContain('https://radar.nexotoken.net/doctor');
    expect(urls).toContain('https://radar.nexotoken.net/methodology');
    expect(new Set(urls).size).toBe(urls.length);
  });
});
