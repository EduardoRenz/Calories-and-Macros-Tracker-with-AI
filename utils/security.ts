/**
 * Validates that a redirect URL is internal and safe.
 * To prevent Open Redirect attacks, we only allow URLs starting with a single '/'
 * and that are not protocol-relative (e.g., '//' or '/\').
 */
export const isValidRedirect = (url: string | null | undefined): url is string => {
  if (!url) return false;
  return url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\');
};
