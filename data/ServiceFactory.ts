import { FoodAnalysisService } from '../domain/services/FoodAnalysisService';
import { GeminiFoodAnalysisService } from './services/GeminiFoodAnalysisService';
import { MockFoodAnalysisService } from './services/MockFoodAnalysisService';
import { OpenAIFoodAnalysisService } from './services/OpenAIFoodAnalysisService';
import { DeepSeekFoodAnalysisService } from './services/DeepSeekFoodAnalysisService';
import { FallbackFoodAnalysisService } from './services/FallbackFoodAnalysisService';
import { GeminiNutritionAnalysisService } from './services/GeminiNutritionAnalysisService';
import { OpenAINutritionAnalysisService } from './services/OpenAINutritionAnalysisService';
import { DeepSeekNutritionAnalysisService } from './services/DeepSeekNutritionAnalysisService';
import { FallbackNutritionAnalysisService } from './services/FallbackNutritionAnalysisService';

const USE_MOCKS = process.env.USE_MOCKS === 'true';

interface ApiKey {
    provider: 'gemini' | 'openai' | 'deepseek';
    key: string;
    addedAt: number;
}

export class ServiceFactory {
    private static instance: FoodAnalysisService | null = null;
    private static nutritionInstance: import("../domain/services/NutritionAnalysisService").NutritionAnalysisService | null = null;

    public static getFoodAnalysisService(): FoodAnalysisService {
        if (USE_MOCKS) {
            return new MockFoodAnalysisService();
        }

        if (!this.instance) {
            this.instance = this.createServiceChain();
        }
        return this.instance;
    }

    public static reset(): void {
        this.instance = null;
        this.nutritionInstance = null;
    }

    private static createServiceChain(): FoodAnalysisService {
        const services: FoodAnalysisService[] = [];

        // 1. Load keys from localStorage
        let savedKeys: ApiKey[] = [];
        if (typeof window !== 'undefined') {
            try {
                const item = localStorage.getItem('ai_api_keys');
                if (item) {
                    savedKeys = JSON.parse(item);
                }
            } catch (e) {
                console.error("Failed to load API keys", e);
            }
        }

        // 2. Instantiate services based on keys
        for (const keyConfig of savedKeys) {
            try {
                switch (keyConfig.provider) {
                    case 'gemini':
                        services.push(new GeminiFoodAnalysisService(keyConfig.key));
                        break;
                    case 'openai':
                        services.push(new OpenAIFoodAnalysisService(keyConfig.key));
                        break;
                    case 'deepseek':
                        services.push(new DeepSeekFoodAnalysisService(keyConfig.key));
                        break;
                }
            } catch (e) {
                console.error(`Failed to instantiate service for ${keyConfig.provider}`, e);
            }
        }

        console.log(`[ServiceFactory] Loaded ${services.length} services from user settings:`, savedKeys.map(k => k.provider));

        // 3. Add default Gemini service (env variable) as last resort
        if (process.env.GEMINI_API_KEY) {
            try {
                services.push(new GeminiFoodAnalysisService(process.env.GEMINI_API_KEY));
            } catch (e) {
                // Ignore
            }
        }

        if (services.length === 0) {
            console.warn("No AI services available.");
        }

        return new FallbackFoodAnalysisService(services);
    }

    public static getNutritionAnalysisService(): import("../domain/services/NutritionAnalysisService").NutritionAnalysisService {
        if (this.nutritionInstance) {
            return this.nutritionInstance;
        }
        this.nutritionInstance = this.createNutritionServiceChain();
        return this.nutritionInstance;
    }

    private static createNutritionServiceChain(): import("../domain/services/NutritionAnalysisService").NutritionAnalysisService {
        const services: import("../domain/services/NutritionAnalysisService").NutritionAnalysisService[] = [];

        let savedKeys: ApiKey[] = [];
        if (typeof window !== 'undefined') {
            try {
                const item = localStorage.getItem('ai_api_keys');
                if (item) {
                    savedKeys = JSON.parse(item);
                }
            } catch (e) {
                console.error("Failed to load API keys", e);
            }
        }

        for (const keyConfig of savedKeys) {
            try {
                switch (keyConfig.provider) {
                    case 'gemini':
                        services.push(new GeminiNutritionAnalysisService(keyConfig.key));
                        break;
                    case 'openai':
                        services.push(new OpenAINutritionAnalysisService(keyConfig.key));
                        break;
                    case 'deepseek':
                        services.push(new DeepSeekNutritionAnalysisService(keyConfig.key));
                        break;
                }
            } catch (e) {
                console.error(`Failed to instantiate nutrition service for ${keyConfig.provider}`, e);
            }
        }

        if (process.env.GEMINI_API_KEY) {
            try {
                services.push(new GeminiNutritionAnalysisService(process.env.GEMINI_API_KEY));
            } catch (e) {
                // Ignore
            }
        }

        if (services.length === 0) {
            console.warn("No Nutrition Analysis services available.");
        }

        return new FallbackNutritionAnalysisService(services);
    }
}
