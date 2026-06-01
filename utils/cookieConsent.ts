const COOKIE_CONSENT_KEY = 'levemente-cookie-consent';

export type CookieConsentStatus = 'accepted' | 'declined' | 'none';

/**
 * Gets the current cookie consent status.
 */
export const getCookieConsentStatus = (): CookieConsentStatus => {
    if (typeof window === 'undefined') return 'none';
    const status = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (status === 'accepted') return 'accepted';
    if (status === 'declined') return 'declined';
    return 'none';
};

/**
 * Checks if the user has accepted cookies.
 */
export const hasCookieConsent = (): boolean => {
    return getCookieConsentStatus() === 'accepted';
};

/**
 * Ensures that sensitive data is only stored if consent is granted.
 * If not granted, it returns false and does NOT store.
 */
export const safeLocalStorageSetItem = (key: string, value: string): boolean => {
    if (hasCookieConsent()) {
        localStorage.setItem(key, value);
        return true;
    }
    console.warn(`Attempted to set ${key} in localStorage without cookie consent.`);
    return false;
};
