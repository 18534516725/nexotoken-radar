import { notFound } from 'next/navigation'; import { PublicFeaturePage } from '@/components/content/PublicFeaturePage'; import { pageMetadata } from '@/lib/pageMetadata'; import { PUBLIC_ROUTES } from '@/lib/publicRoutes';
const paths = new Set(['cheapest','fastest','reliable','most-tested']);
export function generateStaticParams(){ return [...paths].map((kind)=>({kind})); }
export async function generateMetadata({params}:{params:Promise<{kind:string}>}){ const {kind}=await params; const route=PUBLIC_ROUTES.find((item)=>item.path===`/rankings/${kind}`); return route?pageMetadata(route):{}; }
export default async function Page({params}:{params:Promise<{kind:string}>}){ const {kind}=await params; if(!paths.has(kind)) notFound(); const route=PUBLIC_ROUTES.find((item)=>item.path===`/rankings/${kind}`)!; return <PublicFeaturePage route={route}/>; }
