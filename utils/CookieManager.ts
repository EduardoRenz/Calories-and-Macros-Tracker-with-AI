export class CookieManager {
    private static instance: CookieManager;

    private constructor() { }

    public static getInstance(): CookieManager {
        if (!CookieManager.instance) {
            CookieManager.instance = new CookieManager();
        }
        return CookieManager.instance;
    }

    public setCookie(name: string, value: string, expiresInHours: number): void {
        if (typeof document === 'undefined') return;

        const date = new Date();
        date.setTime(date.getTime() + expiresInHours * 60 * 60 * 1000);
        const expires = `expires=${date.toUTCString()}`;
        const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? ';Secure' : '';

        document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Lax${secure}`;
    }

    public getCookie(name: string): string | null {
        if (typeof document === 'undefined') return null;

        const nameEQ = `${name}=`;
        const cookies = document.cookie.split(';');

        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1, cookie.length);
            }
            if (cookie.startsWith(nameEQ)) {
                return decodeURIComponent(cookie.substring(nameEQ.length));
            }
        }

        return null;
    }

    public deleteCookie(name: string): void {
        if (typeof document === 'undefined') return;

        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
}
