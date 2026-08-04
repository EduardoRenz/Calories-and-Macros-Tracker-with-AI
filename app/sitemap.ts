import type { MetadataRoute } from 'next';
import { buildSitemapEntries } from '@/utils/seo/sitemap-builder';

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries([
    { path: '/', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/landing-page', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/plans', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms-of-use', priority: 0.3, changeFrequency: 'yearly' },
  ]);
}
