export const COOKIE_CONSENT_KEY = 'levemente-cookie-consent';

export type CookieConsentStatus = 'accepted' | 'declined' | 'none';

/**
 * Gets the current cookie consent status.
 */
export const getCookieConsentStatus = (): CookieConsentStatus => {
    if (typeof window === 'undefined') return 'none';
    try {
        const status = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (status === 'accepted') return 'accepted';
        if (status === 'declined') return 'declined';
        return 'none';
    } catch (error) {
        console.error('Failed to read cookie consent status:', error);
        return 'none';
    }
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
    if (!hasCookieConsent()) {
        console.warn(`Attempted to set ${key} in localStorage without cookie consent.`);
        return false;
    }

    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.error(`Failed to set ${key} in localStorage:`, error);
        return false;
    }
};
