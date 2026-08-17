import { describe, expect, it } from 'vitest';
import { PRODUCT } from '@/lib/product';

describe('NexoToken Radar product identity', () => {
  it('uses the approved independent product identity and origin', () => {
    expect(PRODUCT.name).toBe('NexoToken Radar');
    expect(PRODUCT.origin).toBe('https://radar.nexotoken.net');
    expect(PRODUCT.disclosure).toContain('NexoToken');
    expect(PRODUCT.disclosure).toContain('independent');
  });
});
