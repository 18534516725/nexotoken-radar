import { PublicFeaturePage } from '@/components/content/PublicFeaturePage'; import { pageMetadata } from '@/lib/pageMetadata'; import { publicRoute } from '@/lib/publicRoutes';
const route = publicRoute('/about'); export const metadata = pageMetadata(route); export default function Page(){ return <PublicFeaturePage route={route}/>; }
