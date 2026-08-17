import type { MetadataRoute } from 'next';
import { sitemapEntries } from '@/lib/seo/discovery';
export default function sitemap(): MetadataRoute.Sitemap { return sitemapEntries(); }
