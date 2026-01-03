/**
 * API Client utility for making authenticated requests to the server.
 * Automatically injects authentication token from Firebase/Supabase.
 */

interface RequestOptions {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
}

class ApiClient {
    private getAuthToken(): string | null {
        // Get token from localStorage (set by AuthContext)
        return localStorage.getItem('authToken');
    }

    async request<T>(url: string, options: RequestOptions): Promise<T> {
        const token = this.getAuthToken();

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config: RequestInit = {
            method: options.method,
            headers,
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        const response = await fetch(url, config);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    async get<T>(url: string): Promise<T> {
        return this.request<T>(url, { method: 'GET' });
    }

    async post<T>(url: string, body?: unknown): Promise<T> {
        return this.request<T>(url, { method: 'POST', body });
    }

    async put<T>(url: string, body?: unknown): Promise<T> {
        return this.request<T>(url, { method: 'PUT', body });
    }

    async delete<T>(url: string, body?: unknown): Promise<T> {
        return this.request<T>(url, { method: 'DELETE', body });
    }
}

export const apiClient = new ApiClient();
