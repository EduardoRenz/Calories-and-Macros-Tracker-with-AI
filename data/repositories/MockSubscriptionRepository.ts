import { SubscriptionRepository } from '../../domain/repositories/SubscriptionRepository';
import { Subscription } from '../../domain/entities/subscription';
import { BillingTransaction } from '../../domain/entities/BillingTransaction';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';
import { DataCacheManager } from '../infrastructure/DataCacheManager';

const STORAGE_KEY = 'mock_subscription_upgraded';
const isBrowser = typeof window !== 'undefined';

export class MockSubscriptionRepository implements SubscriptionRepository {
    private static instance: MockSubscriptionRepository | null = null;
    private concurrencyManager = new ConcurrencyRequestManager();
    private dataCacheManager = new DataCacheManager();

    private constructor() { }

    static getInstance(): MockSubscriptionRepository {
        if (!MockSubscriptionRepository.instance) {
            MockSubscriptionRepository.instance = new MockSubscriptionRepository();
        }
        return MockSubscriptionRepository.instance;
    }

    private getStoredSubscription(): Subscription | null {
        if (!isBrowser) return null;
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                return Subscription.create({
                    ...data,
                    currentPeriodStart: new Date(data.currentPeriodStart),
                    currentPeriodEnd: new Date(data.currentPeriodEnd),
                });
            }
        } catch (e) {
            console.warn('Failed to parse stored subscription', e);
        }
        return null;
    }

    async getUserSubscription(): Promise<Subscription | null> {
        const key = 'getUserSubscription:mock';
        const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

        return this.dataCacheManager.getCached(key, async () => {
            return this.concurrencyManager.run(key, async () => {
                // Check localStorage for upgraded subscription (survives page redirects)
                const storedSubscription = this.getStoredSubscription();
                if (storedSubscription) {
                    return storedSubscription;
                }

                // Return a free subscription by default for mock
                return Subscription.create({
                    id: 'free',
                    userId: 'mock-user-id',
                    planId: 'free',
                    planCode: 'free',
                    status: 'inactive',
                    accessStatus: 'free',
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(),
                    cancelAtPeriodEnd: false,
                });
            });
        }, CACHE_TTL);
    }

    async getBillingHistory(): Promise<BillingTransaction[]> {
        return [];
    }

    /**
     * Upgrades the subscription to premium for 1 month (persisted in localStorage)
     */
    upgradeSubscription(planCode: string): void {
        const now = new Date();
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

        const subscription = Subscription.create({
            id: 'premium',
            userId: 'mock-user-id',
            planId: 'premium',
            planCode: planCode,
            status: 'active',
            accessStatus: 'premium',
            currentPeriodStart: now,
            currentPeriodEnd: oneMonthLater,
            cancelAtPeriodEnd: false,
            isTrial: false,
        });

        // Persist to localStorage so it survives page redirects
        if (isBrowser) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(subscription.toJSON()));
        }

        // Clear cache to force refresh
        this.dataCacheManager.invalidate('getUserSubscription:mock');
    }
}
