import type { MetadataRoute } from 'next';
import { searchPages } from '@/lib/content';
import { absoluteUrl, indexingEnabled } from '@/lib/seo';
export default function sitemap(): MetadataRoute.Sitemap {
  return indexingEnabled() ? searchPages.map(path => ({ url: absoluteUrl(path) })) : [];
}
