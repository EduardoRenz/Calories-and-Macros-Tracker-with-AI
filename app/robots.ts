import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/food-analysis',
        '/historico',
        '/profile',
        '/settings',
        '/checkout',
      ],
    },
    sitemap: 'https://levemente.ia.br/sitemap.xml',
  };
}
