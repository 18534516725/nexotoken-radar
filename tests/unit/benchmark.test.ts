import { describe, expect, it } from 'vitest';
import { confidenceForObservations, percentile, scoreDiagnostic, scoreProvider } from '@/lib/benchmark/score';

describe('transparent benchmark scoring', () => {
  it.each([[0, 'low'], [19, 'low'], [20, 'medium'], [100, 'medium'], [101, 'high']])
    ('maps %s observations to %s confidence', (observations, expected) => {
      expect(confidenceForObservations(observations)).toBe(expected);
    });

  it('calculates deterministic nearest-rank percentiles', () => {
    expect(percentile([10, 20, 30, 40, 50], 0.5)).toBe(30);
    expect(percentile([50, 10, 40, 20, 30], 0.95)).toBe(50);
    expect(percentile([], 0.95)).toBeNull();
  });

  it('uses the published weighted formula', () => {
    expect(scoreProvider({ reliability: 100, compatibility: 90, performance: 80, price: 70, confidence: 60, transparency: 100 })).toBe(85.5);
  });

  it('excludes non-applicable probes while reporting coverage separately', () => {
    expect(scoreDiagnostic([
      { outcome: 'pass', weight: 2, applicable: true },
      { outcome: 'warn', weight: 1, applicable: true },
      { outcome: 'na', weight: 4, applicable: false },
      { outcome: 'skipped', weight: 1, applicable: true },
    ])).toEqual({ score: 83.33, coverage: 75, passed: 1, applicable: 3 });
  });
});
