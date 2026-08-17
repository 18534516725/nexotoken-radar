import { describe, expect, it } from 'vitest';
import { providerDirectoryQuery, rankingMetric } from '@/lib/catalog/query';

describe('catalog query contracts', () => {
  it('builds a bounded, parameterized provider query', () => {
    const result = providerDirectoryQuery({ q: 'route', protocol: 'openai_chat', page: 2 });
    expect(result.sql).toContain('p.name LIKE ?');
    expect(result.sql).toContain('pm.protocol = ?');
    expect(result.sql).not.toContain('route');
    expect(result.params).toEqual(['%route%', '%route%', 'openai_chat', 25, 25]);
  });

  it('rejects unsupported ranking kinds', () => {
    expect(rankingMetric('fastest').orderBy).toContain('median_ttft_ms ASC');
    expect(() => rankingMetric('sponsored')).toThrow('UNKNOWN_RANKING');
  });
});
