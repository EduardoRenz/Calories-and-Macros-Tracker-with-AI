import { Plan } from '../entities/payment';

export interface PlansRepository {
    /**
     * Retrieves the available plans.
     * @param language The current language code (e.g., 'en', 'pt', 'es') to determine currency and localized text.
     */
    getPlans(language: string): Promise<Plan[]>;
}
