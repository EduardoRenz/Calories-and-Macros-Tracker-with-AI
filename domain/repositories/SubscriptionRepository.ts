import { Subscription } from '../entities/subscription';
import { BillingTransaction } from '../entities/BillingTransaction';

export interface SubscriptionRepository {
    /**
     * Retrieves the current user's subscription.
     */
    getUserSubscription(): Promise<Subscription | null>;

    /**
     * Retrieves the billing history for the current user.
     */
    getBillingHistory(): Promise<BillingTransaction[]>;
}
