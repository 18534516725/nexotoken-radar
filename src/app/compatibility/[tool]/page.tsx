import { notFound } from 'next/navigation'; import { PublicFeaturePage } from '@/components/content/PublicFeaturePage'; import { pageMetadata } from '@/lib/pageMetadata'; import { PUBLIC_ROUTES } from '@/lib/publicRoutes';
const tools = new Set(['claude-code','codex','cursor']);
export function generateStaticParams(){ return [...tools].map((tool)=>({tool})); }
export async function generateMetadata({params}:{params:Promise<{tool:string}>}){ const {tool}=await params; const route=PUBLIC_ROUTES.find((item)=>item.path===`/compatibility/${tool}`); return route?pageMetadata(route):{}; }
export default async function Page({params}:{params:Promise<{tool:string}>}){ const {tool}=await params; if(!tools.has(tool)) notFound(); const route=PUBLIC_ROUTES.find((item)=>item.path===`/compatibility/${tool}`)!; return <PublicFeaturePage route={route}/>; }
