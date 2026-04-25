import { SubscriptionRepository } from '../../domain/repositories/SubscriptionRepository';
import { Subscription } from '../../domain/entities/subscription';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';
import { DataCacheManager } from '../infrastructure/DataCacheManager';

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

    async getUserSubscription(): Promise<Subscription | null> {
        const key = 'getUserSubscription:mock';
        const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

        return this.dataCacheManager.getCached(key, async () => {
            return this.concurrencyManager.run(key, async () => {
                // Return a free subscription by default for mock
                return Subscription.create({
                    id: 'free',
                    userId: 'mock-user-id',
                    planId: 'free',
                    status: 'inactive',
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(),
                    cancelAtPeriodEnd: false,
                });
            });
        }, CACHE_TTL);
    }
}
