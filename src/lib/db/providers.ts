import type { RowDataPacket } from 'mysql2';
import { databasePool } from './pool';
import { providerDirectoryQuery, rankingMetric, type DirectoryFilters } from '@/lib/catalog/query';

export type ProviderSummary = RowDataPacket & {
  slug: string; name: string; domain: string; description: string | null; region: string | null;
  claimed: number; model_count: number; last_checked_at: Date | null;
};

export async function listProviders(filters: DirectoryFilters = {}): Promise<ProviderSummary[]> {
  const query = providerDirectoryQuery(filters);
  const [rows] = await databasePool().query<ProviderSummary[]>(query.sql, query.params);
  return rows;
}

export type RankingRow = RowDataPacket & {
  slug: string; name: string; model_name: string; observations: number; confidence: 'low' | 'medium' | 'high';
  success_rate: string | null; median_ttft_ms: number | null; input_price_per_million: string | null;
  stat_date: string; probe_region: string;
};

export async function listRanking(kind: string): Promise<RankingRow[]> {
  const metric = rankingMetric(kind);
  const sql = `SELECT p.slug, p.name, m.canonical_name AS model_name, s.observations, s.confidence,
    s.success_rate, s.median_ttft_ms, prices.input_price_per_million, s.stat_date, s.probe_region
    FROM radar_daily_provider_stats s
    JOIN radar_providers p ON p.id = s.provider_id AND p.status = 'active'
    JOIN radar_models m ON m.id = s.model_id
    LEFT JOIN (
      SELECT pm.provider_id, pm.model_id, MIN(ps.input_price_per_million) AS input_price_per_million
      FROM radar_provider_models pm JOIN radar_price_snapshots ps ON ps.provider_model_id = pm.id
      GROUP BY pm.provider_id, pm.model_id
    ) prices ON prices.provider_id = p.id AND prices.model_id = m.id
    WHERE s.stat_date >= UTC_DATE() - INTERVAL 30 DAY AND s.observations >= 20
    ORDER BY ${metric.orderBy}, p.name ASC LIMIT 100`;
  const [rows] = await databasePool().query<RankingRow[]>(sql);
  return rows;
}

export async function catalogAvailable(): Promise<boolean> {
  return Boolean(process.env.RADAR_DB_HOST && process.env.RADAR_DB_USER && process.env.RADAR_DB_NAME);
}
