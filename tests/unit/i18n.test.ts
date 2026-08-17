import { describe, expect, it } from 'vitest';
import { copy } from '@/lib/i18n';

describe('Radar locale copy', () => {
  it('keeps the Chinese and English navigation structures aligned', () => {
    expect(copy.zh.nav).toHaveLength(5);
    expect(copy.en.nav).toHaveLength(copy.zh.nav.length);
  });

  it('uses Chinese as the default-facing provider directory copy', () => {
    expect(copy.zh.eyebrow).toBe('供应商目录');
    expect(copy.zh.filter).toBe('筛选目录');
    expect(copy.en.eyebrow).toBe('Provider directory');
  });
});
