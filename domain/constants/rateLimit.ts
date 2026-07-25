export interface RateLimitCategory {
    maxRequests: number;
    windowMs: number;
}

export type RateLimitConfig = Record<string, RateLimitCategory>;

export const RATE_LIMIT_CONFIG: RateLimitConfig = {
    chatbot: { maxRequests: 12, windowMs: 60_000 },
    food_analysis: { maxRequests: 20, windowMs: 60_000 },
    nutrition_analysis: { maxRequests: 20, windowMs: 60_000 },
    image_recognition: { maxRequests: 20, windowMs: 60_000 },
    billing: { maxRequests: 10, windowMs: 60_000 },
};
