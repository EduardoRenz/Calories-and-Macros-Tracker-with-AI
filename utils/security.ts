/**
 * Validates that a redirect URL is safe to use.
 * To prevent Open Redirect attacks, it must start with a single '/'
 * and not be a protocol-relative URL (starting with '//' or '/\').
 */
export function isValidRedirect(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;

  // Must start with '/' but not '//' or '/\'
  // These are common ways to trick redirect logic into going to an external domain
  return url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\');
}
