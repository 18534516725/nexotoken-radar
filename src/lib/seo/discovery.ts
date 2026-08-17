import { PRODUCT } from '@/lib/product';
import { PUBLIC_ROUTES } from '@/lib/publicRoutes';

export function sitemapEntries() {
  const paths = ['/', ...PUBLIC_ROUTES.map((route) => route.path)];
  return [...new Set(paths)].map((path) => ({ url: new URL(path, PRODUCT.origin).toString(), changeFrequency: path === '/' ? 'daily' as const : 'weekly' as const, priority: path === '/' ? 1 : path.includes('rankings') ? 0.9 : 0.7 }));
}
