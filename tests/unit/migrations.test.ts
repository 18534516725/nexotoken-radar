import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const migrationDir = join(root, 'migrations');
const rollbackDir = join(migrationDir, 'rollback');
const requiredTables = [
  'radar_providers', 'radar_models', 'radar_provider_models', 'radar_price_snapshots',
  'radar_probe_schedules', 'radar_probe_jobs', 'radar_probe_runs', 'radar_probe_results',
  'radar_daily_provider_stats', 'radar_public_reports', 'radar_provider_submissions',
  'radar_provider_claims', 'radar_correction_requests', 'radar_alert_subscriptions',
  'radar_sponsorships', 'radar_monthly_reports', 'radar_audit_events',
];

describe('Radar database migrations', () => {
  it('defines every approved table with an isolated radar prefix', () => {
    const sql = readdirSync(migrationDir).filter((name) => name.endsWith('.sql'))
      .map((name) => readFileSync(join(migrationDir, name), 'utf8')).join('\n');
    for (const table of requiredTables) expect(sql).toMatch(new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
    const created = [...sql.matchAll(/CREATE TABLE IF NOT EXISTS\s+([a-z0-9_]+)/gi)].map((match) => match[1]);
    expect(created.every((name) => name.startsWith('radar_'))).toBe(true);
  });

  it('provides a matching rollback for every forward migration', () => {
    const forward = readdirSync(migrationDir).filter((name) => /^\d+.*\.sql$/.test(name)).sort();
    const rollback = readdirSync(rollbackDir).filter((name) => /^\d+.*\.sql$/.test(name)).sort();
    expect(rollback).toEqual(forward);
  });

  it('never stores api keys, prompts or completion content', () => {
    const sql = readdirSync(migrationDir).filter((name) => name.endsWith('.sql'))
      .map((name) => readFileSync(join(migrationDir, name), 'utf8')).join('\n').toLowerCase();
    expect(sql).not.toMatch(/api_key|authorization_header|prompt_text|completion_text|response_body/);
  });
});
