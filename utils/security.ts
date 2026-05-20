/**
 * Validates a redirect URL to prevent Open Redirect vulnerabilities.
 * A valid redirect must start with a single '/' and not be protocol-relative (e.g., starting with '//' or '/\').
 *
 * @param url The URL to validate
 * @returns true if the URL is a safe local redirect, false otherwise
 */
export function isValidRedirect(url: string | null | undefined): boolean {
    if (!url) return false;

    // Check if it starts with a single / and is not protocol-relative
    // Example of unsafe: //google.com, /\google.com
    return url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\');
}
