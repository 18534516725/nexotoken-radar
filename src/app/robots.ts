import type { MetadataRoute } from 'next';
import { PRODUCT } from '@/lib/product';
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/doctor/', '/api/submissions'] }, sitemap: `${PRODUCT.origin}/sitemap.xml`, host: PRODUCT.origin }; }
