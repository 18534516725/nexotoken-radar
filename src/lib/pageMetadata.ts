import type { Metadata } from 'next';
import { PRODUCT } from './product';
import type { PublicRoute } from './publicRoutes';

export function pageMetadata(route: PublicRoute): Metadata {
  return {
    title: route.title,
    description: route.description,
    alternates: { canonical: route.path },
    openGraph: { title: route.title, description: route.description, url: `${PRODUCT.origin}${route.path}` },
  };
}
