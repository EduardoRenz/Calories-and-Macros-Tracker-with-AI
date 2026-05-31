import { SubscriptionRepository } from '../../domain/repositories/SubscriptionRepository';
import { Subscription } from '../../domain/entities/subscription';
import { BillingTransaction } from '../../domain/entities/BillingTransaction';
import { Currency } from '../../domain/entities/payment';
import { getSupabaseClient } from '../supabaseClient';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';
import { SupabaseUserSession } from '../infrastructure/SupabaseUserSession';
import { BILLING_CONSTANTS } from '../../domain/constants/billing';

type BillingPlanRow = {
    plan_code: string | null;
};

type BillingSubscriptionRow = {
    id: string;
    user_id: string;
    plan_id: string;
    status: 'pending' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'inactive';
    access_status: 'free' | 'premium' | 'grace_locked';
    current_period_start: string;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    billing_plans: BillingPlanRow | BillingPlanRow[] | null;
};

type BillingTransactionRow = {
    id: string;
    user_id: string;
    subscription_id?: string;
    provider: string;
    provider_transaction_id: string;
    provider_checkout_id?: string;
    transaction_type: 'charge' | 'renewal' | 'refund' | 'dispute' | 'loss';
    status: 'paid' | 'failed' | 'refunded' | 'disputed' | 'lost';
    amount_cents: number;
    currency: string;
    occurred_at: string;
    receipt_url?: string;
    metadata?: Record<string, unknown>;
};

const getPlanCode = (plans: BillingSubscriptionRow['billing_plans']): string => {
    if (Array.isArray(plans)) {
        return plans[0]?.plan_code ?? 'free';
    }
    return plans?.plan_code ?? 'free';
};

export class SupabaseSubscriptionRepository implements SubscriptionRepository {
    private static instance: SupabaseSubscriptionRepository | null = null;
    private concurrencyManager = new ConcurrencyRequestManager();

    private constructor() { }

    static getInstance(): SupabaseSubscriptionRepository {
        if (!SupabaseSubscriptionRepository.instance) {
            SupabaseSubscriptionRepository.instance = new SupabaseSubscriptionRepository();
        }
        return SupabaseSubscriptionRepository.instance;
    }

    private async isUserInTrialPeriod(): Promise<{ isTrial: boolean; trialEndDate: Date | null }> {
        try {
            const user = await SupabaseUserSession.getInstance().getUser();

            if (!user || !user.created_at) {
                return { isTrial: false, trialEndDate: null };
            }

            const createdAt = new Date(user.created_at);
            const now = new Date();
            const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
            const isTrial = daysSinceCreation < BILLING_CONSTANTS.TRIAL_DAYS;
            const trialEndDate = isTrial ? new Date(createdAt.getTime() + BILLING_CONSTANTS.TRIAL_DAYS * 24 * 60 * 60 * 1000) : null;

            return { isTrial, trialEndDate };
        } catch (error) {
            console.error('[SupabaseSubscriptionRepository] Error checking trial period:', error);
            return { isTrial: false, trialEndDate: null };
        }
    }

    async getUserSubscription(): Promise<Subscription | null> {
        let userId: string;
        try {
            userId = await SupabaseUserSession.getInstance().getUserId();
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

        return this.concurrencyManager.run(key, async () => {
            try {
                const supabase = getSupabaseClient();
                const { data, error } = await supabase
                    .from('billing_subscriptions')
                    .select('*, billing_plans(plan_code)')
                    .eq('user_id', userId)
                    .in('status', ['active', 'trialing', 'pending', 'canceled'])
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                const { isTrial, trialEndDate } = await this.isUserInTrialPeriod();

                if (error || !data) {
                    if (isTrial && trialEndDate) {
                        return Subscription.create({
                            id: 'trial',
                            userId,
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

                // Validate if subscription period has expired (fallback protection)
                const subscription = data as BillingSubscriptionRow;
                const now = new Date();
                const periodEndStr = subscription.current_period_end;
                // NULL current_period_end means infinite/lifetime access (e.g., admin plans)
                const isPeriodValid = periodEndStr === null || (!isNaN(new Date(periodEndStr).getTime()) && now <= new Date(periodEndStr));
                const grantsPremiumByStatus = ['active', 'trialing', 'canceled'].includes(subscription.status);

                // If period expired but access_status is still premium, force downgrade
                const effectiveAccessStatus = (subscription.access_status === 'premium' && isPeriodValid && grantsPremiumByStatus)
                    ? 'premium'
                    : 'free';

                return Subscription.create({
                    id: subscription.id,
                    userId: subscription.user_id,
                    planId: subscription.plan_id,
                    planCode: getPlanCode(subscription.billing_plans),
                    status: isPeriodValid ? subscription.status : 'unpaid',
                    accessStatus: effectiveAccessStatus,
                    currentPeriodStart: new Date(subscription.current_period_start),
                    currentPeriodEnd: periodEndStr ? new Date(periodEndStr) : new Date(8640000000000000), // Max date for NULL (infinite)
                    cancelAtPeriodEnd: subscription.cancel_at_period_end,
                    isTrial: isTrial && effectiveAccessStatus !== 'premium',
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
    }

    async getBillingHistory(): Promise<BillingTransaction[]> {
        const userId = await SupabaseUserSession.getInstance().getUserId();
        if (!userId) return [];
        const key = `getBillingHistory:${userId}`;

        return this.concurrencyManager.run(key, async () => {
            try {
                const supabase = getSupabaseClient();
                const { data, error } = await supabase
                    .from('billing_transactions')
                    .select('*')
                    .eq('user_id', userId)
                    .order('occurred_at', { ascending: false });

                if (error || !data) return [];

                return (data as BillingTransactionRow[]).map((item) => BillingTransaction.create({
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
    }
}
