import { SubscriptionRepository } from '../../domain/repositories/SubscriptionRepository';
import { Subscription } from '../../domain/entities/subscription';
import { BillingTransaction } from '../../domain/entities/BillingTransaction';
import { Currency } from '../../domain/entities/payment';
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
                    planCode: 'free',
                    status: 'inactive',
                    accessStatus: 'free',
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
                planCode: 'free',
                status: 'inactive',
                accessStatus: 'free',
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
                        .from('billing_subscriptions')
                        .select('*, billing_plans(plan_code)')
                        .eq('user_id', userId)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();

                    if (error || !data) {
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

                    return Subscription.create({
                        id: data.id,
                        userId: data.user_id,
                        planId: data.plan_id,
                        planCode: (data.billing_plans as any)?.plan_code || 'free',
                        status: data.status,
                        accessStatus: data.access_status,
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
                        planCode: 'free',
                        status: 'inactive',
                        accessStatus: 'free',
                        currentPeriodStart: new Date(),
                        currentPeriodEnd: new Date(),
                        cancelAtPeriodEnd: false,
                    });
                }
            });
        }, CACHE_TTL);
    }

    async getBillingHistory(): Promise<BillingTransaction[]> {
        const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return [];

        const userId = user.id;
        const key = `getBillingHistory:${userId}`;

        return this.dataCacheManager.getCached(key, async () => {
            return this.concurrencyManager.run(key, async () => {
                try {
                    const { data, error } = await supabase
                        .from('billing_transactions')
                        .select('*')
                        .eq('user_id', userId)
                        .order('occurred_at', { ascending: false });

                    if (error || !data) return [];

                    return data.map(item => BillingTransaction.create({
                        id: item.id,
                        userId: item.user_id,
                        subscriptionId: item.subscription_id,
                        provider: item.provider,
                        providerTransactionId: item.provider_transaction_id,
                        providerCheckoutId: item.provider_checkout_id,
                        type: item.transaction_type,
                        status: item.status,
                        amountCents: item.amount_cents,
                        currency: Currency.create(item.currency),
                        occurredAt: new Date(item.occurred_at),
                        receiptUrl: item.receipt_url,
                        metadata: item.metadata,
                    }));
                } catch (error) {
                    console.error('[SupabaseSubscriptionRepository] Error fetching billing history:', error);
                    return [];
                }
            });
        }, CACHE_TTL);
    }
}
