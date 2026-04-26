import { SubscriptionRepository } from '../../domain/repositories/SubscriptionRepository';
import { Subscription } from '../../domain/entities/subscription';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getDb, auth } from '../firebase';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';
import { DataCacheManager } from '../infrastructure/DataCacheManager';
import { BILLING_CONSTANTS } from '../../domain/constants/billing';

export class FirebaseSubscriptionRepository implements SubscriptionRepository {
    private static instance: FirebaseSubscriptionRepository | null = null;
    private concurrencyManager = new ConcurrencyRequestManager();
    private dataCacheManager = new DataCacheManager();

    private constructor() { }

    static getInstance(): FirebaseSubscriptionRepository {
        if (!FirebaseSubscriptionRepository.instance) {
            FirebaseSubscriptionRepository.instance = new FirebaseSubscriptionRepository();
        }
        return FirebaseSubscriptionRepository.instance;
    }

    private async isUserInTrialPeriod(userId: string): Promise<{ isTrial: boolean; trialEndDate: Date | null }> {
        try {
            if (!auth || !auth.currentUser) {
                return { isTrial: false, trialEndDate: null };
            }

            const currentUser = auth.currentUser;
            if (!currentUser.metadata?.creationTime) {
                return { isTrial: false, trialEndDate: null };
            }

            const createdAt = new Date(currentUser.metadata.creationTime);
            const now = new Date();
            const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
            const isTrial = daysSinceCreation < BILLING_CONSTANTS.TRIAL_DAYS;
            const trialEndDate = isTrial ? new Date(createdAt.getTime() + BILLING_CONSTANTS.TRIAL_DAYS * 24 * 60 * 60 * 1000) : null;

            return { isTrial, trialEndDate };
        } catch (error) {
            console.error('[FirebaseSubscriptionRepository] Error checking trial period:', error);
            return { isTrial: false, trialEndDate: null };
        }
    }

    async getUserSubscription(): Promise<Subscription | null> {
        const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

        // Wait for auth to be ready
        if (!auth) {
            console.log('[FirebaseSubscriptionRepository] Auth not initialized, returning free plan');
            return this.createFreeSubscription('unknown');
        }

        // Get current user - if null, auth might still be loading
        const currentUser = auth.currentUser;

        if (!currentUser) {
            console.log('[FirebaseSubscriptionRepository] No current user, returning free plan');
            return this.createFreeSubscription('unknown');
        }

        const key = `getUserSubscription:${currentUser.uid}`;

        return this.dataCacheManager.getCached(key, async () => {
            return this.concurrencyManager.run(key, async () => {
                try {
                    const db = getDb();

                    const subscriptionsRef = collection(db, 'subscriptions');
                    const q = query(
                        subscriptionsRef,
                        where('userId', '==', currentUser.uid),
                        where('status', 'in', ['active', 'trialing', 'pending'])
                    );

                    const querySnapshot = await getDocs(q);

                    console.log('[FirebaseSubscriptionRepository] Query snapshot empty:', querySnapshot.empty);

                    const { isTrial, trialEndDate } = await this.isUserInTrialPeriod(currentUser.uid);

                    if (querySnapshot.empty) {
                        if (isTrial && trialEndDate) {
                            return Subscription.create({
                                id: 'trial',
                                userId: currentUser.uid,
                                planId: 'trial',
                                planCode: 'trial',
                                status: 'trialing',
                                accessStatus: 'premium',
                                currentPeriodStart: new Date(),
                                currentPeriodEnd: trialEndDate,
                                cancelAtPeriodEnd: false,
                                isTrial: true,
                            });
                        }

                        // Return a free subscription if no active subscription found
                        console.log('[FirebaseSubscriptionRepository] No active subscription found, returning free plan');
                        return this.createFreeSubscription(currentUser.uid);
                    }

                    const doc = querySnapshot.docs[0];
                    const data = doc.data();

                    console.log('[FirebaseSubscriptionRepository] Found subscription:', data);

                    return Subscription.create({
                        id: doc.id,
                        userId: data.userId,
                        planId: data.planId || 'free',
                        planCode: data.planCode || 'free',
                        status: data.status,
                        accessStatus: data.accessStatus || (data.status === 'active' ? 'premium' : 'free'),
                        currentPeriodStart: data.currentPeriodStart?.toDate() || new Date(),
                        currentPeriodEnd: data.currentPeriodEnd?.toDate() || new Date(),
                        cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
                        isTrial: isTrial && data.accessStatus !== 'premium',
                    });
                } catch (error) {
                    console.error('[FirebaseSubscriptionRepository] Error fetching subscription:', error);
                    // Return free subscription on error
                    return this.createFreeSubscription('unknown');
                }
            });
        }, CACHE_TTL);
    }

    async getBillingHistory(): Promise<any[]> {
        return [];
    }

    private createFreeSubscription(userId: string): Subscription {
        return Subscription.create({
            id: 'free',
            userId,
            planId: 'free',
            planCode: 'free',
            status: 'inactive',
            accessStatus: 'free',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(),
            cancelAtPeriodEnd: false,
        });
    }
}
