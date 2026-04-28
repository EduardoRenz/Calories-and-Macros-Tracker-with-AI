import { getSupabaseClient } from '../supabaseClient';
import { PlanProviderMapping, PlansRepository } from '../../domain/repositories/PlansRepository';
import { Currency, Plan, PlanFeature } from '../../domain/entities/payment';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';
import { DataCacheManager } from '../infrastructure/DataCacheManager';

interface PlanLocaleData {
    name?: string;
    description?: string;
    price?: number;
    currency?: string;
    features?: PlanFeature[];
    isPopular?: boolean;
    discountMessage?: string;
    originalPrice?: number;
}

interface BillingPlanProviderMappingRow {
    id: string;
    plan_id: string;
    provider: string;
    provider_product_id: string;
    provider_product_external_id?: string | null;
    provider_price_amount: number;
    currency: string;
    provider_cycle: string;
}

interface BillingPlanRow {
    id: string;
    plan_code: string;
    display_order: number;
    billing_interval: 'month' | 'year';
    active: boolean;
    locales?: Record<string, PlanLocaleData>;
    billing_plan_provider_mappings?: BillingPlanProviderMappingRow[];
}

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
                        .from('billing_plans')
                        .select(`
                            id,
                            plan_code,
                            display_order,
                            billing_interval,
                            active,
                            billing_plan_provider_mappings (
                                id,
                                plan_id,
                                provider,
                                provider_product_id,
                                provider_product_external_id,
                                provider_price_amount,
                                currency,
                                provider_cycle
                            )
                        `)
                        .eq('active', true)
                        .order('display_order', { ascending: true });

                    if (error) throw error;

                    return ((data || []) as BillingPlanRow[]).map(row => {
                        const primaryMapping = this.getPrimaryMapping(row);

                        return Plan.create({
                            id: row.plan_code,
                            name: row.plan_code === 'free' ? 'Free' : (row.billing_interval === 'month' ? 'Monthly' : 'Annual'),
                            description: '',
                            price: this.toMajorAmount(primaryMapping?.provider_price_amount ?? 0),
                            currency: Currency.create(primaryMapping?.currency || 'BRL'),
                            interval: row.billing_interval,
                            features: [], // Handled by frontend translation logic
                            isPopular: false,
                            discountMessage: undefined,
                            originalPrice: undefined,
                            provider: primaryMapping?.provider || 'internal',
                            externalPlanId: primaryMapping?.provider_product_id || row.plan_code,
                        });
                    });
                } catch (error) {
                    console.error('[SupabasePlansRepository] Error fetching plans:', error);
                    return [];
                }
            });
        });
    }

    async getProviderMapping(planCode: string, provider: string): Promise<PlanProviderMapping | null> {
        const cacheKey = `plan-provider-mapping:supabase:${planCode}:${provider}`;

        return this.dataCacheManager.getCached(cacheKey, async () => {
            return this.concurrencyManager.run(cacheKey, async () => {
                try {
                    const supabase = getSupabaseClient();
                    const { data: plan, error: planError } = await supabase
                        .from('billing_plans')
                        .select('id, plan_code, active')
                        .eq('plan_code', planCode)
                        .eq('active', true)
                        .maybeSingle();

                    if (planError) throw planError;
                    if (!plan) return null;

                    const billingPlan = plan as Pick<BillingPlanRow, 'id' | 'plan_code' | 'active'>;
                    const { data: mapping, error: mappingError } = await supabase
                        .from('billing_plan_provider_mappings')
                        .select(`
                            id,
                            plan_id,
                            provider,
                            provider_product_id,
                            provider_product_external_id,
                            provider_price_amount,
                            currency,
                            provider_cycle
                        `)
                        .eq('plan_id', billingPlan.id)
                        .eq('provider', provider)
                        .maybeSingle();

                    if (mappingError) throw mappingError;
                    if (!mapping) return null;

                    return this.toProviderMapping(billingPlan, mapping as BillingPlanProviderMappingRow);
                } catch (error) {
                    console.error('[SupabasePlansRepository] Error fetching plan provider mapping:', error);
                    return null;
                }
            });
        });
    }

    private getLocaleData(row: BillingPlanRow, language: string): PlanLocaleData {
        return row.locales?.[language] || row.locales?.en || {};
    }

    private getPrimaryMapping(row: BillingPlanRow): BillingPlanProviderMappingRow | undefined {
        return row.billing_plan_provider_mappings?.[0];
    }

    private toMajorAmount(amountCents: number): number {
        return amountCents / 100;
    }

    private toProviderMapping(
        plan: Pick<BillingPlanRow, 'id' | 'plan_code'>,
        mapping: BillingPlanProviderMappingRow,
    ): PlanProviderMapping {
        return {
            planId: plan.id,
            planCode: plan.plan_code,
            provider: mapping.provider,
            providerProductId: mapping.provider_product_id,
            providerProductExternalId: mapping.provider_product_external_id || undefined,
            providerPriceAmount: mapping.provider_price_amount,
            currency: mapping.currency,
            providerCycle: mapping.provider_cycle,
        };
    }
}
