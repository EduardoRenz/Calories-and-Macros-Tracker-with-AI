const ACCESS_ERROR_PATTERNS = ['Premium', 'premium', 'API key', 'api_key', 'API Key'];

/**
 * Detects messages that represent expected access outcomes (premium required,
 * missing API keys) rather than genuine failures.
 */
export function isAccessErrorMessage(message: string): boolean {
    return ACCESS_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}