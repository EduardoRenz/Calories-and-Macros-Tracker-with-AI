import { buildCanonicalUrl } from '../../../utils/seo/canonical';
import { buildSeoMetadata } from '../../../utils/seo/metadata';
import {
  buildSoftwareAppJsonLd,
  buildWebApplicationJsonLd,
  buildFaqJsonLd,
} from '../../../utils/seo/jsonld';
import { buildSitemapEntries } from '../../../utils/seo/sitemap-builder';
import { shouldIndexHost } from '../../../utils/seo/index-gating';

describe('buildSitemapEntries', () => {
  it('UT-003: generates correct sitemap items array from public routes', () => {
    const entries = buildSitemapEntries([
      { path: '/', priority: 1.0, changeFrequency: 'weekly' },
      { path: '/plans', priority: 0.8 },
    ]);

    expect(entries).to.have.length(2);
    expect(entries[0].url).to.equal('https://levemente.ia.br/');
    expect(entries[0].changeFrequency).to.equal('weekly');
    expect(entries[0].priority).to.equal(1.0);
    expect(entries[1].url).to.equal('https://levemente.ia.br/plans');
    expect(entries[1].priority).to.equal(0.8);
    expect(entries[1].changeFrequency).to.equal('weekly');
  });
});

describe('buildCanonicalUrl', () => {
  it('UT-008: strips UTM tracking parameters from URL', () => {
    const result = buildCanonicalUrl(
      '/calculadora-macros?utm_source=google&utm_medium=cpc&utm_campaign=summer'
    );
    expect(result).to.equal('https://levemente.ia.br/calculadora-macros');
  });

  it('strips gclid and fbclid parameters', () => {
    const result = buildCanonicalUrl(
      '/landing-page?gclid=abc123&fbclid=def456&utm_term=macro+calculator'
    );
    expect(result).to.equal('https://levemente.ia.br/landing-page');
  });

  it('preserves non-tracking query parameters', () => {
    const result = buildCanonicalUrl('/share/meal/123?ref=partner');
    expect(result).to.equal('https://levemente.ia.br/share/meal/123?ref=partner');
  });

  it('handles root path correctly', () => {
    const result = buildCanonicalUrl('/');
    expect(result).to.equal('https://levemente.ia.br/');
  });

  it('preserves locale subpath when already in path', () => {
    const result = buildCanonicalUrl('/en/calculadora-macros');
    expect(result).to.equal('https://levemente.ia.br/en/calculadora-macros');
  });
});

describe('buildSeoMetadata', () => {
  it('UT-001: produces absolute metadata object with canonical URL given valid inputs', () => {
    const metadata = buildSeoMetadata({
      title: 'Macro Calculator',
      description: 'Calculate your daily macros',
      path: '/calculadora-macros',
      ogImage: '/og/macro-calc.png',
      locale: 'pt',
    });

    expect(metadata.title).to.equal('Macro Calculator');
    expect(metadata.description).to.equal('Calculate your daily macros');
    expect(metadata.alternates?.canonical).to.equal(
      'https://levemente.ia.br/calculadora-macros'
    );
    expect(metadata.openGraph?.title).to.equal('Macro Calculator');
    expect(metadata.openGraph?.locale).to.equal('pt_BR');
    expect((metadata.twitter as { card: string })?.card).to.equal('summary_large_image');
  });

  it('UT-002: applies fallback title when given empty title', () => {
    const metadata = buildSeoMetadata({
      title: '',
      description: 'Some description',
      path: '/some-page',
    });
    expect(metadata.title).to.equal(
      'LeveMente AI - Calorie & Macro Tracker'
    );
  });

  it('UT-009: generates correct OpenGraph image alt text', () => {
    const metadata = buildSeoMetadata({
      title: 'Test Page',
      description: 'Test description',
      path: '/test',
      ogImage: '/og/test.png',
    });
    const images = metadata.openGraph?.images;
    expect(images).to.not.be.undefined;
    if (Array.isArray(images) && images.length > 0) {
      const img = images[0] as { url: string; alt: string };
      expect(img.alt).to.equal('Test Page');
    }
  });

  it('sets noIndex when option is true', () => {
    const metadata = buildSeoMetadata({
      title: 'No Index',
      description: 'Should not be indexed',
      path: '/hidden',
      noIndex: true,
    });
    expect(metadata.robots).to.deep.equal({ index: false, follow: false });
  });

  it('defaults locale to pt_BR when not provided', () => {
    const metadata = buildSeoMetadata({
      title: 'Title',
      description: 'Desc',
      path: '/page',
    });
    expect(metadata.openGraph?.locale).to.equal('pt_BR');
  });
});

describe('buildSoftwareAppJsonLd', () => {
  it('UT-004: produces valid SoftwareApplication JSON-LD object', () => {
    const result = buildSoftwareAppJsonLd({
      name: 'LeveMente AI',
      description: 'AI-powered meal tracking',
      url: 'https://levemente.ia.br',
      operatingSystem: 'Web, iOS, Android PWA',
      applicationCategory: 'HealthApplication',
      price: '0',
      priceCurrency: 'BRL',
    });

    expect(result).to.deep.equal({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'LeveMente AI',
      description: 'AI-powered meal tracking',
      url: 'https://levemente.ia.br',
      operatingSystem: 'Web, iOS, Android PWA',
      applicationCategory: 'HealthApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL',
      },
    });
  });
});

describe('buildWebApplicationJsonLd', () => {
  it('produces valid WebApplication JSON-LD object', () => {
    const result = buildWebApplicationJsonLd({
      name: 'LeveMente AI',
      description: 'AI-powered meal tracking',
      url: 'https://levemente.ia.br',
      operatingSystem: 'Web',
      applicationCategory: 'HealthApplication',
      price: '0',
      priceCurrency: 'BRL',
    });

    expect(result['@type']).to.equal('WebApplication');
    expect(result['@context']).to.equal('https://schema.org');
    expect(result.offers.price).to.equal('0');
  });
});

describe('buildFaqJsonLd', () => {
  it('UT-005: produces valid FAQPage JSON-LD object from question-answer pairs', () => {
    const faqs = [
      { question: 'What is LeveMente?', answer: 'An AI nutrition tracker.' },
      { question: 'Is it free?', answer: 'Yes, with premium options.' },
    ];

    const result = buildFaqJsonLd(faqs);

    expect(result).to.deep.equal({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is LeveMente?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'An AI nutrition tracker.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is it free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, with premium options.',
          },
        },
      ],
    });
  });

  it('handles empty FAQ array', () => {
    const result = buildFaqJsonLd([]);
    expect(result.mainEntity).to.deep.equal([]);
  });
});

describe('shouldIndexHost', () => {
  it('UT-009: returns true for the production host', () => {
    expect(shouldIndexHost('levemente.ia.br')).to.equal(true);
  });

  it('UT-010: returns true for the production host with port', () => {
    expect(shouldIndexHost('levemente.ia.br:3000')).to.equal(true);
  });

  it('UT-011: returns true for the www production host', () => {
    expect(shouldIndexHost('www.levemente.ia.br')).to.equal(true);
  });

  it('UT-012: returns false for the dev subdomain', () => {
    expect(shouldIndexHost('dev.levemente.ia.br')).to.equal(false);
  });

  it('UT-013: returns false for unknown hosts and missing host', () => {
    expect(shouldIndexHost('preview.levemente.vercel.app')).to.equal(false);
    expect(shouldIndexHost(null)).to.equal(false);
    expect(shouldIndexHost(undefined)).to.equal(false);
  });
});
