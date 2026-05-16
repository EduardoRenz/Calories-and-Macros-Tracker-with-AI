import { env } from '../../env';

/**
 * Returns the redirect URL for OAuth authentication callbacks.
 *
 * Priority:
 * 1. NEXT_PUBLIC_APP_URL env var (useful for preview deployments or explicit overrides)
 * 2. window.location.origin (dynamic based on current URL)
 *
 * The returned URL is always normalized (no trailing slash).
 */
export const getAuthRedirectUrl = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }

  const envUrl = env.NEXT_PUBLIC_APP_URL;
  const baseUrl = envUrl
    ? envUrl.replace(/\/$/, '')
    : window.location.origin;

  return `${baseUrl}/auth/callback?next=/dashboard`;
};
