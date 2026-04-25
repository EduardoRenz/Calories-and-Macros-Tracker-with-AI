import { SubscriptionRepository } from '../../domain/repositories/SubscriptionRepository';
import { Subscription } from '../../domain/entities/subscription';
import { getSupabaseClient } from '../supabaseClient';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';
import { DataCacheManager } from '../infrastructure/DataCacheManager';

export class SupabaseSubscriptionRepository implements SubscriptionRepository {
    private static instance: SupabaseSubscriptionRepository | null = null;
    private concurrencyManager = new ConcurrencyRequestManager();
    private dataCacheManager = new DataCacheManager();

    private constructor() { }

    static getInstance(): SupabaseSubscriptionRepository {
        if (!SupabaseSubscriptionRepository.instance) {
            SupabaseSubscriptionRepository.instance = new SupabaseSubscriptionRepository();
        }
        return SupabaseSubscriptionRepository.instance;
    }

    async getUserSubscription(): Promise<Subscription | null> {
        const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

        let userId: string;
        try {
            const supabase = getSupabaseClient();
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                console.log('[SupabaseSubscriptionRepository] No current user, returning free plan');
                return Subscription.create({
                    id: 'free',
                    userId: 'unknown',
                    planId: 'free',
                    status: 'inactive',
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(),
                    cancelAtPeriodEnd: false,
                });
            }

            userId = user.id;
        } catch (error) {
            console.error('[SupabaseSubscriptionRepository] Error fetching user:', error);
            return Subscription.create({
                id: 'free',
                userId: 'unknown',
                planId: 'free',
                status: 'inactive',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(),
                cancelAtPeriodEnd: false,
            });
        }

        const key = `getUserSubscription:${userId}`;

        return this.dataCacheManager.getCached(key, async () => {
            return this.concurrencyManager.run(key, async () => {
                try {
                    const supabase = getSupabaseClient();
                    const { data, error } = await supabase
                        .from('subscriptions')
                        .select('*')
                        .eq('user_id', userId)
                        .in('status', ['active', 'trialing'])
                        .single();

                    if (error || !data) {
                        // Return a free subscription if no active subscription found
                        return Subscription.create({
                            id: 'free',
                            userId,
                            planId: 'free',
                            status: 'inactive',
                            currentPeriodStart: new Date(),
                            currentPeriodEnd: new Date(),
                            cancelAtPeriodEnd: false,
                        });
                    }

                    return Subscription.create({
                        id: data.id,
                        userId: data.user_id,
                        planId: data.plan_id || 'free',
                        status: data.status,
                        currentPeriodStart: new Date(data.current_period_start),
                        currentPeriodEnd: new Date(data.current_period_end),
                        cancelAtPeriodEnd: data.cancel_at_period_end,
                    });
                } catch (error) {
                    console.error('[SupabaseSubscriptionRepository] Error fetching subscription:', error);
                    return Subscription.create({
                        id: 'free',
                        userId,
                        planId: 'free',
                        status: 'inactive',
                        currentPeriodStart: new Date(),
                        currentPeriodEnd: new Date(),
                        cancelAtPeriodEnd: false,
                    });
                }
            });
        }, CACHE_TTL);
    }
}
