const APP_URL = 'https://levemente.ia.br';

const TRACKING_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'gbraid',
  'wbraid',
];

export function buildCanonicalUrl(rawPath: string): string {
  const url = new URL(rawPath, APP_URL);

  for (const param of TRACKING_PARAMS) {
    url.searchParams.delete(param);
  }

  const cleanUrl = new URL(url.pathname, APP_URL);

  const remainingParams = url.searchParams.toString();
  if (remainingParams) {
    cleanUrl.search = remainingParams;
  }

  return cleanUrl.origin + cleanUrl.pathname + (cleanUrl.search || '');
}
