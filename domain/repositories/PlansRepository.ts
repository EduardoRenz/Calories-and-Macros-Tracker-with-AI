import { Plan } from '../entities/payment';

export interface PlanProviderMapping {
    planId: string;
    planCode: string;
    provider: string;
    providerProductId: string;
    providerProductExternalId?: string;
    providerPriceAmount: number;
    currency: string;
    providerCycle: string;
}

export interface PlansRepository {
    /**
     * Retrieves the available plans.
     * @param language The current language code (e.g., 'en', 'pt', 'es') to determine currency and localized text.
     */
    getPlans(language: string): Promise<Plan[]>;

    /**
     * Resolves provider-specific billing data for server-side checkout flows
     * without making public plan rendering depend on provider-owned identity.
     * Provider is auto-detected from environment if not provided.
     */
    getProviderMapping(planCode: string, provider?: string): Promise<PlanProviderMapping | null>;
}
