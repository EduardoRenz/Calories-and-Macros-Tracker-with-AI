import type { MetadataRoute } from 'next';

const APP_URL = 'https://levemente.ia.br';

export interface SitemapEntryConfig {
  path: string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export function buildSitemapEntries(entries: SitemapEntryConfig[]): MetadataRoute.Sitemap {
  return entries.map(({ path, changeFrequency, priority }) => ({
    url: `${APP_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: changeFrequency ?? 'weekly',
    priority: priority ?? 0.5,
  }));
}
