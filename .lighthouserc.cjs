const COLLECT_URLS = [
  'http://localhost:3000/',
  'http://localhost:3000/plans',
  'http://localhost:3000/calculadora-macros',
  'http://localhost:3000/landing-page',
];

module.exports = {
  ci: {
    collect: {
      url: COLLECT_URLS,
      numberOfRuns: 1,
      startServerCommand: 'NEXT_PUBLIC_BACKEND_PROVIDER=mock PAYMENT_PROVIDER=mock next start',
      startServerReadyPattern: 'Local:',
      settings: {
        preset: 'desktop',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 1 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
