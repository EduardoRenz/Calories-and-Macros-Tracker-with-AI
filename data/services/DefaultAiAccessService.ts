import { AiAccessFeature, AiAccessService } from "../../domain/services/AiAccessService";
import { FeatureFlagRepository, FeatureFlags } from "../../domain/repositories/FeatureFlagRepository";
import { SubscriptionRepository } from "../../domain/repositories/SubscriptionRepository";
import { UserApiKeysRepository } from "../../domain/repositories/UserApiKeysRepository";
import { AiDisabledException, PremiumOnlyException, ApiKeysRequiredException } from "../../domain/exceptions/AiAccessException";

export class DefaultAiAccessService implements AiAccessService {
    private static instance: DefaultAiAccessService;

    private constructor(
        private readonly featureFlagRepo: FeatureFlagRepository,
        private readonly subscriptionRepo: SubscriptionRepository,
        private readonly userApiKeysRepo: UserApiKeysRepository
    ) {}

    public static getInstance(
        featureFlagRepo: FeatureFlagRepository,
        subscriptionRepo: SubscriptionRepository,
        userApiKeysRepo: UserApiKeysRepository
    ): DefaultAiAccessService {
        if (!DefaultAiAccessService.instance) {
            DefaultAiAccessService.instance = new DefaultAiAccessService(
                featureFlagRepo,
                subscriptionRepo,
                userApiKeysRepo
            );
        }
        return DefaultAiAccessService.instance;
    }

    async checkAccess(feature: AiAccessFeature): Promise<void> {
        const mode = await this.featureFlagRepo.getValue(FeatureFlags.AI_ACCESS_MODE) as string || 'premium_only';
        
        if (mode === 'disabled') {
            throw new AiDisabledException();
        }

        const subscription = await this.subscriptionRepo.getUserSubscription();
        const isPremium = subscription?.isActive || false;

        // Premium always has access unless mode is disabled
        if (isPremium) {
            return;
        }

        const minPlan = await this.getMinPlan(feature);

        // Evaluate access based on minPlan
        if (minPlan === 'premium') {
            throw new PremiumOnlyException();
        }

        if (minPlan === 'free_plan_api_keys') {
            if (!this.userApiKeysRepo.hasApiKeys()) {
                throw new ApiKeysRequiredException();
            }
            return;
        }

        // If minPlan is 'open' or 'free', check if the global mode still imposes restrictions
        if (mode === 'free_plan_api_keys_only') {
            // If minPlan was already determined as 'open' by getMinPlan, it won't be 'free_plan_api_keys' here.
            // But we double check the global restriction if no specific config exists.
            const requirements = await this.featureFlagRepo.getValue(FeatureFlags.FEATURE_REQUIREMENTS) as any;
            const featureConfig = (requirements?.feature_requirements || requirements)?.[feature];
            
            if (!featureConfig?.min_plan) {
                if (!this.userApiKeysRepo.hasApiKeys()) {
                    throw new ApiKeysRequiredException();
                }
            }
        }
    }

    async getMinPlan(feature: AiAccessFeature): Promise<'premium' | 'free_plan_api_keys' | 'open'> {
        const mode = await this.featureFlagRepo.getValue(FeatureFlags.AI_ACCESS_MODE) as string || 'premium_only';

        // Get specific feature requirements
        let requirements = await this.featureFlagRepo.getValue(FeatureFlags.FEATURE_REQUIREMENTS) as any;
        
        // Robustness: handle nested structure
        if (requirements && requirements.feature_requirements) {
            requirements = requirements.feature_requirements;
        }

        const featureConfig = requirements?.[feature];

        if (featureConfig?.min_plan) {
            return featureConfig.min_plan as any;
        }

        // Fallback logic
        if (mode === 'premium_only') {
            return 'premium';
        } else if (mode === 'free_plan_api_keys_only') {
            return 'free_plan_api_keys';
        }
        
        return 'premium';
    }

    async isFeatureAvailable(feature: AiAccessFeature): Promise<boolean> {
        try {
            await this.checkAccess(feature);
            return true;
        } catch {
            return false;
        }
    }
}
