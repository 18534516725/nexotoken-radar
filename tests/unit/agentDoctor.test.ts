import { describe, expect, it } from 'vitest';
import { AGENT_DOCTOR } from '@/lib/github/releases';
describe('Agent Doctor acquisition', () => { it('only points to the official NexoToken repository', () => { expect(AGENT_DOCTOR.repository).toBe('https://github.com/18534516725/Agent-Doctor'); expect(AGENT_DOCTOR.latestRelease).toBe(`${AGENT_DOCTOR.repository}/releases/latest`); }); });
