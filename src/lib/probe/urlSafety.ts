import { isIP } from 'node:net';
import { lookup } from 'node:dns/promises';

export class UnsafeTargetError extends Error {
  readonly code = 'UNSAFE_TARGET';
}

type Resolver = (hostname: string) => Promise<string[]>;

const defaultResolver: Resolver = async (hostname) => {
  const records = await lookup(hostname, { all: true, verbatim: true });
  return [...new Set(records.map((record) => record.address))];
};

function publicIpv4(address: string): boolean {
  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b, c] = parts;
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 168) return false;
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return false;
  if (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) return false;
  if (a === 203 && b === 0 && c === 113) return false;
  return true;
}

function publicIpv6(address: string): boolean {
  const normalized = address.toLowerCase().replace(/^\[|\]$/g, '');
  if (normalized === '::' || normalized === '::1') return false;
  if (normalized.startsWith('::ffff:')) return publicIpv4(normalized.slice(7));
  if (/^f[cd]/.test(normalized) || /^fe[89ab]/.test(normalized) || normalized.startsWith('ff')) return false;
  if (normalized.startsWith('2001:db8')) return false;
  const first = Number.parseInt(normalized.split(':')[0] || '0', 16);
  return first >= 0x2000 && first <= 0x3fff;
}

export function isPublicAddress(address: string): boolean {
  const version = isIP(address.replace(/^\[|\]$/g, ''));
  if (version === 4) return publicIpv4(address);
  if (version === 6) return publicIpv6(address);
  return false;
}

export type InspectedTarget = {
  url: URL;
  addresses: string[];
};

export async function inspectTargetUrl(raw: string, resolver: Resolver = defaultResolver): Promise<InspectedTarget> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UnsafeTargetError('A valid HTTPS Base URL is required.');
  }

  if (url.protocol !== 'https:') throw new UnsafeTargetError('Only HTTPS targets are allowed.');
  if (url.username || url.password) throw new UnsafeTargetError('Credentials are not allowed in the URL.');
  if (url.hash) throw new UnsafeTargetError('URL fragments are not allowed.');
  if (url.port && url.port !== '443' && url.port !== '8443') throw new UnsafeTargetError('This target port is not allowed.');

  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    throw new UnsafeTargetError('The target must use a public hostname.');
  }

  const addresses = isIP(hostname) ? [hostname] : await resolver(hostname);
  if (addresses.length === 0 || addresses.some((address) => !isPublicAddress(address))) {
    throw new UnsafeTargetError('Every resolved target address must be public.');
  }

  url.hostname = hostname;
  return { url, addresses };
}
