import Link from 'next/link';
import type { ProviderSummary } from '@/lib/db/providers';

export function ProviderDirectory({ providers }: { providers: ProviderSummary[] }) {
  if (!providers.length) return <section className="catalog-empty"><p className="eyebrow">EVIDENCE QUEUE</p><h2>No verified providers are published yet.</h2><p>Applications remain private until sources are reviewed and a reproducible observation window exists.</p><Link className="button" href="/submit">Submit a provider</Link></section>;
  return <div className="catalog-list">{providers.map((provider, index) => <article key={provider.slug}>
    <span className="catalog-list__index">{String(index + 1).padStart(2, '0')}</span><div><p className="eyebrow">{provider.region || 'REGION NOT DECLARED'} · {provider.claimed ? 'CLAIMED' : 'INDEPENDENT PROFILE'}</p><h2>{provider.name}</h2><p>{provider.description || 'Profile description is awaiting source review.'}</p></div><dl><div><dt>Models</dt><dd>{provider.model_count}</dd></div><div><dt>Freshness</dt><dd>{provider.last_checked_at ? new Date(provider.last_checked_at).toLocaleDateString('en-CA') : 'Unobserved'}</dd></div></dl>
  </article>)}</div>;
}
