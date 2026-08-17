import { ProviderDirectory } from '@/components/provider/ProviderDirectory';
import { pageMetadata } from '@/lib/pageMetadata';
import { publicRoute } from '@/lib/publicRoutes';
import { catalogAvailable, listProviders, type ProviderSummary } from '@/lib/db/providers';
const route = publicRoute('/providers'); export const metadata = pageMetadata(route);
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; protocol?: string; page?: string }> }) {
  const params = await searchParams; let providers: ProviderSummary[] = [];
  if (await catalogAvailable()) { try { providers = await listProviders({ q: params.q, protocol: params.protocol, page: Number(params.page || 1) }); } catch { providers = []; } }
  return <main className="feature-page shell"><header className="feature-page__header"><p className="eyebrow">{route.eyebrow}</p><h1>{route.heading}</h1><p>{route.description}</p></header>
    <form className="catalog-filter"><label><span>Search</span><input name="q" defaultValue={params.q} placeholder="Provider or description" /></label><label><span>Protocol</span><select name="protocol" defaultValue={params.protocol || ''}><option value="">All protocols</option><option value="openai_chat">OpenAI Chat</option><option value="openai_responses">Responses</option><option value="anthropic_messages">Anthropic Messages</option></select></label><button className="button" type="submit">Filter directory</button></form>
    <ProviderDirectory providers={providers} /></main>;
}
