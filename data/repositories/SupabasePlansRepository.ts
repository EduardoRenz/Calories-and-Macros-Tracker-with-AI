import { getSupabaseClient } from '../supabaseClient';
import { PlansRepository } from '../../domain/repositories/PlansRepository';
import { Plan, Currency } from '../../domain/entities/payment';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';
import { DataCacheManager } from '../infrastructure/DataCacheManager';

export class SupabasePlansRepository implements PlansRepository {
    private static instance: SupabasePlansRepository | null = null;
    private concurrencyManager = new ConcurrencyRequestManager();
    private dataCacheManager = new DataCacheManager();

    private constructor() { }

    static getInstance(): SupabasePlansRepository {
        if (!this.instance) {
            this.instance = new SupabasePlansRepository();
        }
        return this.instance;
    }

    async getPlans(language: string): Promise<Plan[]> {
        const cacheKey = `plans:supabase:${language}`;

        return this.dataCacheManager.getCached(cacheKey, async () => {
            return this.concurrencyManager.run(cacheKey, async () => {
                try {
                    const supabase = getSupabaseClient();
                    const { data, error } = await supabase
                        .from('plans')
                        .select('*')
                        .eq('active', true);

                    if (error) throw error;

                    return (data || []).map(row => {
                        const localeData = row.locales?.[language] || row.locales?.['en'] || {};

                        return Plan.create({
                            id: row.id,
                            name: localeData.name || row.name || '',
                            description: localeData.description || row.description,
                            price: localeData.price ?? row.price ?? 0,
                            currency: Currency.create(localeData.currency || row.currency || 'USD'),
                            interval: row.interval || 'month',
                            features: localeData.features || row.features || [],
                            isPopular: row.isPopular ?? row.is_popular ?? false,
                            discountMessage: localeData.discountMessage || row.discountMessage || row.discount_message,
                            originalPrice: localeData.originalPrice ?? row.originalPrice ?? row.original_price,
                            provider: row.payment_provider || row.provider || 'internal',
                            externalPlanId: row.external_plan_id || row.externalPlanId || row.id
                        });
                    });
                } catch (error) {
                    console.error('[SupabasePlansRepository] Error fetching plans:', error);
                    return [];
                }
            });
        });
    }
}
