/**
 * Manages cooldown state for AI services to avoid retrying failed providers immediately.
 * When a service fails, it enters a cooldown period where it will be skipped.
 * Each service has its own cooldown duration stored at failure time.
 */
export interface CooldownEntry {
    timestamp: number;
    durationMs: number;
}

export class ServiceCooldownManager {
    private static instance: ServiceCooldownManager;
    private cooldowns: Map<string, CooldownEntry> = new Map();
    private readonly defaultCooldownMs: number;

    private constructor(defaultCooldownSeconds: number = 60) {
        this.defaultCooldownMs = defaultCooldownSeconds * 1000;
    }

    /**
     * Gets the singleton instance. Default cooldown only used if instance doesn't exist.
     * Per-service cooldowns are specified in recordFailure().
     */
    static getInstance(): ServiceCooldownManager {
        if (!ServiceCooldownManager.instance) {
            ServiceCooldownManager.instance = new ServiceCooldownManager(60);
        }
        return ServiceCooldownManager.instance;
    }

    /**
     * Records a failure for a service, putting it in cooldown
     * @param serviceName - Name of the service that failed
     * @param cooldownSeconds - Cooldown duration for this specific failure (default: 60)
     */
    recordFailure(serviceName: string, cooldownSeconds: number = 60): void {
        const durationMs = cooldownSeconds * 1000;
        this.cooldowns.set(serviceName, {
            timestamp: Date.now(),
            durationMs
        });
        console.log(`[CooldownManager] ${serviceName} entered cooldown for ${cooldownSeconds}s`);
    }

    /**
     * Checks if a service is currently in cooldown.
     * Automatically cleans up expired entries to prevent memory leaks.
     */
    isInCooldown(serviceName: string): boolean {
        const entry = this.cooldowns.get(serviceName);
        if (!entry) return false;

        const elapsed = Date.now() - entry.timestamp;
        if (elapsed >= entry.durationMs) {
            // Cooldown expired, clean up
            this.cooldowns.delete(serviceName);
            return false;
        }

        const remaining = Math.ceil((entry.durationMs - elapsed) / 1000);
        console.log(`[CooldownManager] ${serviceName} is in cooldown (${remaining}s remaining)`);
        return true;
    }

    /**
     * Gets remaining cooldown time for a service in seconds
     */
    getRemainingCooldown(serviceName: string): number {
        const entry = this.cooldowns.get(serviceName);
        if (!entry) return 0;

        const elapsed = Date.now() - entry.timestamp;
        const remaining = entry.durationMs - elapsed;
        return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
    }

    /**
     * Clears all cooldowns (useful for testing)
     */
    clearAll(): void {
        this.cooldowns.clear();
    }
}
