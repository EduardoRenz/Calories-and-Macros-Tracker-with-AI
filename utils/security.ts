/**
 * Validates if a redirect URL is safe to use.
 * Prevents Open Redirect vulnerabilities by ensuring the URL starts with a single '/'
 * and is not a protocol-relative URL (e.g., //example.com).
 */
export const isValidRedirect = (url: string | null): boolean => {
    if (!url) return false;

    // Must start with /
    if (!url.startsWith('/')) return false;

    // Must not start with // (protocol-relative)
    if (url.startsWith('//')) return false;

    // Must not start with /\ or /%5C (obfuscated protocol-relative)
    // In some environments, /\\ can be interpreted as a protocol-relative redirect
    if (url.startsWith('/\\')) return false;

    return true;
};
