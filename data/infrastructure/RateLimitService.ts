import { RATE_LIMIT_CONFIG } from '@/domain/constants/rateLimit';

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetMs: number;
    maxRequests: number;
}

export class RateLimitService {
    private static instance: RateLimitService;
    private requests: Map<string, number[]> = new Map();

    private constructor() {}

    static getInstance(): RateLimitService {
        if (!RateLimitService.instance) {
            RateLimitService.instance = new RateLimitService();
        }
        return RateLimitService.instance;
    }

    check(userId: string, category: string): RateLimitResult {
        const config = RATE_LIMIT_CONFIG[category];
        if (!config) {
            return { allowed: true, remaining: Infinity, resetMs: 0, maxRequests: Infinity };
        }

        const key = `${userId}:${category}`;
        const now = Date.now();
        const timestamps = this.requests.get(key) ?? [];

        const validTimestamps = timestamps.filter(ts => now - ts < config.windowMs);

        if (validTimestamps.length >= config.maxRequests) {
            const oldest = validTimestamps[0];
            const resetMs = config.windowMs - (now - oldest);
            this.requests.set(key, validTimestamps);
            console.log(
                `[RateLimit] 429 for user=${userId} category=${category} remaining=0 reset=${Math.ceil(resetMs / 1000)}`
            );
            return { allowed: false, remaining: 0, resetMs, maxRequests: config.maxRequests };
        }

        validTimestamps.push(now);
        this.requests.set(key, validTimestamps);

        const remaining = config.maxRequests - validTimestamps.length;
        const resetMs = config.windowMs - (now - validTimestamps[0]);

        return { allowed: true, remaining, resetMs, maxRequests: config.maxRequests };
    }

    clear(): void {
        this.requests.clear();
    }
}
