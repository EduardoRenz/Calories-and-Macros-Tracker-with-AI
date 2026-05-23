/**
 * Validates a redirect URL to prevent Open Redirect vulnerabilities.
 * A valid redirect must:
 * 1. Start with a single '/'
 * 2. Not be a protocol-relative URL (e.g., '//example.com')
 * 3. Not use backslashes (e.g., '/\example.com')
 *
 * @param url The URL to validate
 * @returns boolean indicating if the URL is a safe internal redirect
 */
export const isValidRedirect = (url: string | null | undefined): boolean => {
    if (!url) return false;

    // Check if it starts with a single '/' and isn't followed by another '/' or '\'
    // This prevents protocol-relative redirects and some bypasses
    return url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\');
};
