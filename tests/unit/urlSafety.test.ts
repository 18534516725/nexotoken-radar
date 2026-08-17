import { describe, expect, it } from 'vitest';
import { inspectTargetUrl, isPublicAddress } from '@/lib/probe/urlSafety';

describe('outbound target safety', () => {
  it.each([
    '127.0.0.1', '10.0.0.4', '172.16.1.2', '192.168.1.9', '169.254.169.254',
    '0.0.0.0', '::1', 'fc00::1', 'fe80::1', '224.0.0.1',
  ])('rejects non-public address %s', (address) => {
    expect(isPublicAddress(address)).toBe(false);
  });

  it.each(['1.1.1.1', '8.8.8.8', '2606:4700:4700::1111'])('accepts public address %s', (address) => {
    expect(isPublicAddress(address)).toBe(true);
  });

  it.each([
    'http://api.example.com/v1',
    'https://user:pass@api.example.com/v1',
    'https://localhost/v1',
    'https://api.internal/v1',
    'https://api.example.com:22/v1',
  ])('rejects unsafe URL shape %s', async (target) => {
    await expect(inspectTargetUrl(target, async () => ['93.184.216.34'])).rejects.toThrow();
  });

  it('rejects a hostname when any resolved address is private', async () => {
    await expect(inspectTargetUrl('https://api.example.com/v1', async () => ['93.184.216.34', '127.0.0.1']))
      .rejects.toThrow(/public/i);
  });

  it('returns a normalized URL and pinned public addresses', async () => {
    const inspected = await inspectTargetUrl('https://API.Example.com/v1/', async () => ['93.184.216.34']);
    expect(inspected.url.toString()).toBe('https://api.example.com/v1/');
    expect(inspected.addresses).toEqual(['93.184.216.34']);
  });
});
