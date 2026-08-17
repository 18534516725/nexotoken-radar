export type Confidence = 'low' | 'medium' | 'high';

export function confidenceForObservations(observations: number): Confidence {
  if (observations > 100) return 'high';
  if (observations >= 20) return 'medium';
  return 'low';
}

export function percentile(values: readonly number[], quantile: number): number | null {
  if (values.length === 0) return null;
  if (quantile < 0 || quantile > 1) throw new RangeError('quantile must be between 0 and 1');
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.max(1, Math.ceil(quantile * sorted.length));
  return sorted[rank - 1]!;
}

export type ProviderScoreInput = {
  reliability: number;
  compatibility: number;
  performance: number;
  price: number;
  confidence: number;
  transparency: number;
};

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function scoreProvider(input: ProviderScoreInput): number {
  const score = clamp(input.reliability) * 0.30
    + clamp(input.compatibility) * 0.20
    + clamp(input.performance) * 0.20
    + clamp(input.price) * 0.15
    + clamp(input.confidence) * 0.10
    + clamp(input.transparency) * 0.05;
  return Math.round(score * 1000) / 1000;
}
