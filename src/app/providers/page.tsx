import { ProviderDirectory } from '@/components/provider/ProviderDirectory';
import { publicRoute } from '@/lib/publicRoutes';
import { catalogAvailable, listProviders, type ProviderSummary } from '@/lib/db/providers';
import { copy } from '@/lib/i18n';
import { getLocale } from '@/lib/i18n.server';
import type { Metadata } from 'next';
const route = publicRoute('/providers');

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = copy[locale];
  return {
    title: locale === 'zh' ? 'AI API 供应商目录' : route.title,
    description: t.description,
    alternates: { canonical: route.path },
    openGraph: { title: locale === 'zh' ? 'AI API 供应商目录' : route.title, description: t.description, url: route.path },
  };
}
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; protocol?: string; page?: string }> }) {
  const params = await searchParams; const locale = await getLocale(); const t = copy[locale]; let providers: ProviderSummary[] = [];
  if (await catalogAvailable()) { try { providers = await listProviders({ q: params.q, protocol: params.protocol, page: Number(params.page || 1) }); } catch { providers = []; } }
  return <main className="feature-page shell"><header className="feature-page__header"><p className="eyebrow">{t.eyebrow}</p><h1>{t.heading}</h1><p>{t.description}</p></header>
    <form className="catalog-filter"><label><span>{t.search}</span><input name="q" defaultValue={params.q} placeholder={t.searchPlaceholder} /></label><label><span>{t.protocol}</span><select name="protocol" defaultValue={params.protocol || ''}><option value="">{t.allProtocols}</option><option value="openai_chat">OpenAI Chat</option><option value="openai_responses">Responses</option><option value="anthropic_messages">Anthropic Messages</option></select></label><button className="button" type="submit">{t.filter}</button></form>
    <ProviderDirectory providers={providers} locale={locale} /></main>;
}
