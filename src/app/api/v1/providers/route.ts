import { NextResponse } from 'next/server';
import { catalogAvailable, listProviders } from '@/lib/db/providers';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  if (!await catalogAvailable()) return NextResponse.json({ data: [], meta: { version: 'radar-v1', source: 'NexoToken Radar', state: 'database-unavailable' } }, { headers: { 'Cache-Control': 'public, max-age=60' } });
  const url = new URL(request.url);
  try { const data = await listProviders({ q: url.searchParams.get('q') || undefined, protocol: url.searchParams.get('protocol') || undefined, page: Number(url.searchParams.get('page') || 1) }); return NextResponse.json({ data, meta: { version: 'radar-v1', methodology: '1.0', license: 'CC BY 4.0', generatedAt: new Date().toISOString() } }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }); }
  catch { return NextResponse.json({ error: { code: 'CATALOG_UNAVAILABLE', message: 'The public catalog is temporarily unavailable.' } }, { status: 503 }); }
}
