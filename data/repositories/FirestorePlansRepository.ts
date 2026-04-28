import { collection, getDocs } from 'firebase/firestore';
import { getDb } from '../firebase';
import { PlanProviderMapping, PlansRepository } from '../../domain/repositories/PlansRepository';
import { Plan, Currency } from '../../domain/entities/payment';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';
import { DataCacheManager } from '../infrastructure/DataCacheManager';

export class FirestorePlansRepository implements PlansRepository {
    private static instance: FirestorePlansRepository | null = null;
    private concurrencyManager = new ConcurrencyRequestManager();
    private dataCacheManager = new DataCacheManager();

    private constructor() { }

    static getInstance(): FirestorePlansRepository {
        if (!this.instance) {
            this.instance = new FirestorePlansRepository();
        }
        return this.instance;
    }

    async getPlans(language: string): Promise<Plan[]> {
        const cacheKey = `plans:${language}`;

        return this.dataCacheManager.getCached(cacheKey, async () => {
            return this.concurrencyManager.run(cacheKey, async () => {
                try {
                    const plansCollection = collection(getDb(), 'plans');
                    const plansSnapshot = await getDocs(plansCollection);

                    return plansSnapshot.docs.map(doc => {
                        const data = doc.data();
                        const localeData = data.locales?.[language] || data.locales?.['en'] || {};

                        return Plan.create({
                            id: doc.id,
                            name: localeData.name || data.name || '',
                            description: localeData.description || data.description,
                            price: localeData.price ?? data.price ?? 0,
                            currency: Currency.create(localeData.currency || data.currency || 'USD'),
                            interval: data.interval || 'month',
                            features: localeData.features || data.features || [],
                            isPopular: data.isPopular ?? data.is_popular ?? false,
                            discountMessage: localeData.discountMessage || data.discountMessage || data.discount_message,
                            originalPrice: localeData.originalPrice ?? data.originalPrice ?? data.original_price,
                            provider: data.provider || 'internal',
                            externalPlanId: data.external_plan_id || data.externalPlanId || doc.id
                        });
                    });
                } catch (error) {
                    console.error('[FirestorePlansRepository] Error fetching plans:', error);
                    return [];
                }
            });
        });
    }

    async getProviderMapping(planCode: string, provider: string): Promise<PlanProviderMapping | null> {
        const cacheKey = `plan-provider-mapping:firestore:${planCode}:${provider}`;

        return this.dataCacheManager.getCached(cacheKey, async () => {
            return this.concurrencyManager.run(cacheKey, async () => {
                try {
                    const plansCollection = collection(getDb(), 'plans');
                    const plansSnapshot = await getDocs(plansCollection);
                    const planDoc = plansSnapshot.docs.find(doc => doc.id === planCode);

                    if (!planDoc) return null;

                    const data = planDoc.data();
                    const planProvider = data.provider || data.payment_provider || 'internal';

                    if (planProvider !== provider) return null;

                    return {
                        planId: planDoc.id,
                        planCode: planDoc.id,
                        provider: planProvider,
                        providerProductId: data.external_plan_id || data.externalPlanId || planDoc.id,
                        providerProductExternalId: data.provider_product_external_id,
                        providerPriceAmount: data.provider_price_amount || 0,
                        currency: data.currency || 'BRL',
                        providerCycle: data.interval || 'month',
                    };
                } catch (error) {
                    console.error('[FirestorePlansRepository] Error fetching plan provider mapping:', error);
                    return null;
                }
            });
        });
    }
}
