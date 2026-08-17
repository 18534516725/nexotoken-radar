import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('isolated production package', () => {
  it('contains only Radar services and a health check', () => {
    const compose = readFileSync('docker-compose.production.yml', 'utf8');
    expect(compose).toContain('radar-web:');
    expect(compose).toContain('radar-worker:');
    expect(compose).toContain('/api/health');
    expect(compose).not.toMatch(/payment-(backend|frontend)/);
  });

  it('does not commit production secrets', () => {
    const env = readFileSync('.env.example', 'utf8');
    expect(env).toContain('RADAR_DB_PASSWORD=change-me');
    expect(env).not.toMatch(/BEGIN (RSA |EC )?PRIVATE KEY/);
  });

  it('repairs the pnpm standalone SWC helper trace', () => {
    const dockerfile = readFileSync('Dockerfile', 'utf8');
    expect(dockerfile).toContain('standalone/node_modules/.pnpm');
    expect(dockerfile).toContain('@swc/helpers');
  });
});
