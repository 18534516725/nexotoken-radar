import { Agent, fetch } from 'undici';
import type { ProbeTransport, TransportResponse } from './diagnostic';
import { inspectTargetUrl } from './urlSafety';

const MAX_RESPONSE_BYTES = 64 * 1024;
const TEST_TIMEOUT_MS = 15_000;

export function buildEndpointUrl(baseUrl: string, endpointPath: string): URL {
  const base = new URL(baseUrl);
  const normalizedBase = base.pathname.replace(/\/$/, '');
  const normalizedEndpoint = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
  if (!normalizedBase.endsWith(normalizedEndpoint)) base.pathname = `${normalizedBase}${normalizedEndpoint}`;
  base.search = '';
  base.hash = '';
  return base;
}

async function readPreview(response: Response, signal: AbortSignal): Promise<string> {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let preview = '';
  try {
    while (bytes < MAX_RESPONSE_BYTES && !signal.aborted) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      preview += decoder.decode(value.slice(0, Math.max(0, MAX_RESPONSE_BYTES - (bytes - value.byteLength))), { stream: true });
      if (preview.includes('\n\n') && response.headers.get('content-type')?.includes('text/event-stream')) break;
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  return preview;
}

export const safeProbeTransport: ProbeTransport = async (request): Promise<TransportResponse> => {
  const endpoint = buildEndpointUrl(request.baseUrl, request.path);
  const inspected = await inspectTargetUrl(endpoint.toString());
  const pinned = inspected.addresses[0]!;
  const family = pinned.includes(':') ? 6 : 4;
  const dispatcher = new Agent({
    connect: {
      // undici 7 expects the dns.lookup callback to receive address records.
      lookup: (_hostname, _options, callback) => callback(null, [{ address: pinned, family }]),
    },
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TEST_TIMEOUT_MS);
  const started = performance.now();

  try {
    const response = await fetch(inspected.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(request.body),
      redirect: 'manual',
      signal: controller.signal,
      dispatcher,
    });
    const firstByteMs = Math.round(performance.now() - started);
    if (response.status >= 300 && response.status < 400) {
      return { status: 502, headers: {}, firstByteMs, totalMs: firstByteMs, bodyPreview: '' };
    }
    const bodyPreview = await readPreview(response as unknown as Response, controller.signal);
    const totalMs = Math.round(performance.now() - started);
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      firstByteMs,
      totalMs,
      bodyPreview,
    };
  } finally {
    clearTimeout(timeout);
    await dispatcher.close();
  }
};
