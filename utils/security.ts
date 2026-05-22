/**
 * Validates if a redirect URL is safe to use.
 * To prevent Open Redirect vulnerabilities, we only allow internal redirects.
 * A safe internal redirect must:
 * 1. Start with a single '/'
 * 2. Not be a protocol-relative URL (e.g., '//evil.com')
 *
 * @param url The URL to validate
 * @returns true if the URL is a safe internal redirect, false otherwise
 */
export const isValidRedirect = (url: string | null | undefined): boolean => {
    if (!url) return false;

    // Must start with '/'
    if (!url.startsWith('/')) return false;

    // Must not be protocol-relative (//) or have multiple slashes at the start
    if (url.startsWith('//') || url.startsWith('/\\')) return false;

    return true;
};
