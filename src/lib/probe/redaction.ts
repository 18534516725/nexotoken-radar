export type PublicProbeError = {
  code: 'INVALID_REQUEST' | 'UNSAFE_TARGET' | 'AUTHENTICATION_FAILED' | 'MODEL_UNAVAILABLE' |
    'RATE_LIMITED' | 'TEST_TIMEOUT' | 'PROVIDER_UNAVAILABLE';
  message: string;
};

function redactString(value: string, secrets: readonly string[]): string {
  let safe = value;
  for (const secret of secrets) {
    if (secret) safe = safe.split(secret).join('[REDACTED]');
  }
  return safe
    .replace(/Bearer\s+[A-Za-z0-9._~+\/-]+/gi, 'Bearer [REDACTED]')
    .replace(/(x-api-key\s*[=:]\s*)[^\s,;]+/gi, '$1[REDACTED]');
}

export function redactValue(value: unknown, secrets: readonly string[] = []): unknown {
  if (typeof value === 'string') return redactString(value, secrets);
  if (Array.isArray(value)) return value.map((entry) => redactValue(entry, secrets));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [
      /authorization|credential|secret|token/i.test(key) ? 'redacted' : key,
      /authorization|credential|secret|token/i.test(key) ? '[REDACTED]' : redactValue(entry, secrets),
    ]));
  }
  return value;
}

export function publicProbeError(error: unknown): PublicProbeError {
  const candidate = error as { code?: string; status?: number; name?: string } | null;
  if (candidate?.code === 'UNSAFE_TARGET') return { code: 'UNSAFE_TARGET', message: 'This Base URL is not permitted for remote testing.' };
  if (candidate?.status === 401 || candidate?.status === 403) return { code: 'AUTHENTICATION_FAILED', message: 'Authentication or model permission was rejected.' };
  if (candidate?.status === 404) return { code: 'MODEL_UNAVAILABLE', message: 'The requested model or API path was not found.' };
  if (candidate?.status === 429) return { code: 'RATE_LIMITED', message: 'The provider rate-limited this test.' };
  if (candidate?.name === 'AbortError' || candidate?.code === 'TEST_TIMEOUT') return { code: 'TEST_TIMEOUT', message: 'The provider did not finish within the test limit.' };
  return { code: 'PROVIDER_UNAVAILABLE', message: 'The provider could not complete this test.' };
}
