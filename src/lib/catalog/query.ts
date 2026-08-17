export type DirectoryFilters = { q?: string; protocol?: string; page?: number };

export function providerDirectoryQuery(filters: DirectoryFilters) {
  const conditions = ["p.status = 'active'"];
  const params: Array<string | number> = [];
  if (filters.q) { conditions.push('(p.name LIKE ? OR p.description LIKE ?)'); params.push(`%${filters.q}%`, `%${filters.q}%`); }
  if (filters.protocol) { conditions.push('pm.protocol = ?'); params.push(filters.protocol); }
  const page = Math.max(1, Math.min(400, filters.page || 1));
  const limit = 25;
  return {
    sql: `SELECT p.slug, p.name, p.domain, p.description, p.region, p.claimed,
      COUNT(DISTINCT pm.id) AS model_count, MAX(pm.last_checked_at) AS last_checked_at
      FROM radar_providers p
      LEFT JOIN radar_provider_models pm ON pm.provider_id = p.id
      WHERE ${conditions.join(' AND ')}
      GROUP BY p.id ORDER BY p.name ASC LIMIT ? OFFSET ?`,
    params: [...params, limit, (page - 1) * limit],
  };
}

const RANKINGS = {
  cheapest: { label: 'Lowest published input price', orderBy: 'input_price_per_million ASC' },
  fastest: { label: 'Lowest median time to first token', orderBy: 'median_ttft_ms ASC' },
  reliable: { label: 'Highest recent success rate', orderBy: 'success_rate DESC' },
  'most-tested': { label: 'Largest observation count', orderBy: 'observations DESC' },
} as const;

export function rankingMetric(kind: string) {
  const metric = RANKINGS[kind as keyof typeof RANKINGS];
  if (!metric) throw new Error('UNKNOWN_RANKING');
  return metric;
}
