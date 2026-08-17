import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { createProviderSubmission } from '@/lib/db/submissions';
import { createSlidingWindowLimiter } from '@/lib/rateLimit';
import { providerSubmissionSchema } from '@/lib/validation/submission';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limiter = createSlidingWindowLimiter({ limit: 3, windowMs: 60 * 60 * 1000 });

export async function POST(request: Request) {
  const key = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  const allowance = limiter.allow(key);
  if (!allowance.allowed) return NextResponse.json({ error: { message: 'Too many submissions. Please try again later.' } }, { status: 429 });
  if (Number(request.headers.get('content-length') || '0') > 32_768) return NextResponse.json({ error: { message: 'Submission is too large.' } }, { status: 413 });
  try {
    const input = providerSubmissionSchema.parse(await request.json());
    const result = await createProviderSubmission(input);
    return NextResponse.json({ result }, { status: result.duplicate ? 200 : 201, headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) return NextResponse.json({ error: { message: 'Check the required fields and HTTPS links.' } }, { status: 400 });
    return NextResponse.json({ error: { message: 'The application could not be recorded. Please try again later.' } }, { status: 503 });
  }
}
