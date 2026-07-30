import type { Metadata } from 'next';
import { buildCanonicalUrl } from './canonical';

const APP_URL = 'https://levemente.ia.br';
const DEFAULT_TITLE = 'LeveMente AI - Calorie & Macro Tracker';
const DEFAULT_DESCRIPTION = 'Acompanhe suas refeições e alcance seus objetivos de forma saudável.';

const OG_LOCALE_MAP: Record<string, string> = {
  pt: 'pt_BR',
  en: 'en_US',
  es: 'es_ES',
};

export interface SeoMetadataOptions {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  locale?: string;
  noIndex?: boolean;
}

export function buildSeoMetadata(options: SeoMetadataOptions): Metadata {
  const title = options.title || DEFAULT_TITLE;
  const description = options.description || DEFAULT_DESCRIPTION;
  const canonical = buildCanonicalUrl(options.path);

  return {
    title,
    description,
    metadataBase: new URL(APP_URL),
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'LeveMente AI',
      locale: (options.locale && OG_LOCALE_MAP[options.locale]) || 'pt_BR',
      type: 'website',
      ...(options.ogImage && {
        images: [
          {
            url: options.ogImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(options.ogImage && { images: [options.ogImage] }),
    },
    ...(options.noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
