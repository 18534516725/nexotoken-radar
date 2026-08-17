import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { diagnosticInputSchema, runDiagnostic } from '@/lib/probe/diagnostic';
import { publicProbeError } from '@/lib/probe/redaction';
import { safeProbeTransport } from '@/lib/probe/safeTransport';
import { createSlidingWindowLimiter } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createSlidingWindowLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

function clientKey(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

export async function POST(request: Request) {
  const length = Number(request.headers.get('content-length') || '0');
  if (length > 16_384) return NextResponse.json({ error: { code: 'INVALID_REQUEST', message: 'The test request is too large.' } }, { status: 413 });

  const allowance = limiter.allow(clientKey(request));
  if (!allowance.allowed) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMITED', message: 'Too many tests. Please wait before trying again.' } },
      { status: 429, headers: { 'retry-after': String(Math.ceil(allowance.retryAfterMs / 1000)) } },
    );
  }

  try {
    const input = diagnosticInputSchema.parse(await request.json());
    const result = await runDiagnostic(input, safeProbeTransport);
    return NextResponse.json({ result }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return NextResponse.json({ error: { code: 'INVALID_REQUEST', message: 'Check the Base URL, model, protocol and credential fields.' } }, { status: 400 });
    }
    const safe = publicProbeError(error);
    const status = safe.code === 'UNSAFE_TARGET' ? 400 : safe.code === 'RATE_LIMITED' ? 429 : 502;
    return NextResponse.json({ error: safe }, { status, headers: { 'cache-control': 'no-store' } });
  }
}
