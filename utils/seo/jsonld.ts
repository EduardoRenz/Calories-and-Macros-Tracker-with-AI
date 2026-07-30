export interface SoftwareAppSchemaOptions {
  name: string;
  description: string;
  url: string;
  operatingSystem: string;
  applicationCategory: string;
  price: string;
  priceCurrency: string;
}

export interface FaqItemSchema {
  question: string;
  answer: string;
}

export function buildSoftwareAppJsonLd(options: SoftwareAppSchemaOptions): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: options.name,
    description: options.description,
    url: options.url,
    operatingSystem: options.operatingSystem,
    applicationCategory: options.applicationCategory,
    offers: {
      '@type': 'Offer',
      price: options.price,
      priceCurrency: options.priceCurrency,
    },
  };
}

export function buildWebApplicationJsonLd(options: SoftwareAppSchemaOptions): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: options.name,
    description: options.description,
    url: options.url,
    operatingSystem: options.operatingSystem,
    applicationCategory: options.applicationCategory,
    offers: {
      '@type': 'Offer',
      price: options.price,
      priceCurrency: options.priceCurrency,
    },
  };
}

export function buildFaqJsonLd(faqs: FaqItemSchema[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
