import Link from 'next/link';
import type { ProviderSummary } from '@/lib/db/providers';
import { copy, type Locale } from '@/lib/i18n';

export function ProviderDirectory({ providers, locale }: { providers: ProviderSummary[]; locale: Locale }) {
  const t = copy[locale];
  if (!providers.length) return <section className="catalog-empty"><p className="eyebrow">{t.queue}</p><h2>{t.emptyTitle}</h2><p>{t.emptyDescription}</p><Link className="button" href="/submit">{t.submit}</Link></section>;
  return <div className="catalog-list">{providers.map((provider, index) => <article key={provider.slug}>
    <span className="catalog-list__index">{String(index + 1).padStart(2, '0')}</span><div><p className="eyebrow">{provider.region || t.region} · {provider.claimed ? t.claimed : t.independent}</p><h2>{provider.name}</h2><p>{provider.description || t.emptyDescription}</p></div><dl><div><dt>{t.models}</dt><dd>{provider.model_count}</dd></div><div><dt>{t.freshness}</dt><dd>{provider.last_checked_at ? new Date(provider.last_checked_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-CA') : t.unobserved}</dd></div></dl>
  </article>)}</div>;
}
