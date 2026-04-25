import { Subscription } from '../entities/subscription';

export interface SubscriptionRepository {
    /**
     * Retrieves the current user's subscription.
     */
    getUserSubscription(): Promise<Subscription | null>;
}
