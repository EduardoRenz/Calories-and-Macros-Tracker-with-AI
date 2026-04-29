import { FoodAnalysisService } from '../domain/services/FoodAnalysisService';
import { GeminiFoodAnalysisService } from './services/GeminiFoodAnalysisService';
import { MockFoodAnalysisService } from './services/MockFoodAnalysisService';
import { OpenAIFoodAnalysisService } from './services/OpenAIFoodAnalysisService';
import { DeepSeekFoodAnalysisService } from './services/DeepSeekFoodAnalysisService';
import { OpenRouterFoodAnalysisService } from './services/OpenRouterFoodAnalysisService';
import { FallbackFoodAnalysisService } from './services/FallbackFoodAnalysisService';
import { MockNutritionAnalysisService } from './services/MockNutritionAnalysisService';
import { MockImageRecognitionService } from './services/MockImageRecognitionService';
import { ChatAssistantService } from '../domain/services/ChatAssistantService';
import { MockChatAssistantService } from './services/MockChatAssistantService';
import { GeminiChatAssistantService } from './services/GeminiChatAssistantService';
import { OpenAIChatAssistantService } from './services/OpenAIChatAssistantService';
import { DeepSeekChatAssistantService } from './services/DeepSeekChatAssistantService';
import { OpenRouterChatAssistantService } from './services/OpenRouterChatAssistantService';
import { FallbackChatAssistantService } from './services/FallbackChatAssistantService';

import { GeminiNutritionAnalysisService } from './services/GeminiNutritionAnalysisService';
import { OpenAINutritionAnalysisService } from './services/OpenAINutritionAnalysisService';
import { DeepSeekNutritionAnalysisService } from './services/DeepSeekNutritionAnalysisService';
import { OpenRouterNutritionAnalysisService } from './services/OpenRouterNutritionAnalysisService';
import { FallbackNutritionAnalysisService } from './services/FallbackNutritionAnalysisService';

import { ImageRecognitionService } from '../domain/services/ImageRecognitionService';
import { GeminiImageRecognitionService } from './services/GeminiImageRecognitionService';
import { OpenAIImageRecognitionService } from './services/OpenAIImageRecognitionService';
import { DeepSeekImageRecognitionService } from './services/DeepSeekImageRecognitionService';
import { OpenRouterImageRecognitionService } from './services/OpenRouterImageRecognitionService';
import { FallbackImageRecognitionService } from './services/FallbackImageRecognitionService';

import { NextApiFoodAnalysisService } from './services/NextApiFoodAnalysisService';
import { NextApiNutritionAnalysisService } from './services/NextApiNutritionAnalysisService';
import { NextApiImageRecognitionService } from './services/NextApiImageRecognitionService';
import { NextApiChatAssistantService } from './services/NextApiChatAssistantService';
import { BrowserImageCompressionService } from './services/BrowserImageCompressionService';
import { ImageCompressionService } from '../domain/services/ImageCompressionService';

import { RepositoryFactory } from './RepositoryFactory';
import { env } from '../env';

const USE_MOCKS = env.NEXT_PUBLIC_BACKEND_PROVIDER === 'mock';

interface ApiKey {
    provider: 'gemini' | 'openai' | 'deepseek' | 'openrouter';
    key: string;
    addedAt: number;
}

export class ServiceFactory {
    private static instance: FoodAnalysisService | null = null;
    private static nutritionInstance: import("../domain/services/NutritionAnalysisService").NutritionAnalysisService | null = null;
    private static imageInstance: ImageRecognitionService | null = null;
    private static chatInstance: ChatAssistantService | null = null;
    private static compressionInstance: ImageCompressionService | null = null;

    public static getFoodAnalysisService(): FoodAnalysisService {
        if (this.instance) {
            return this.instance;
        }
        if (USE_MOCKS) {
            this.instance = new MockFoodAnalysisService();
            return this.instance;
        }

        if (!this.instance) {
            this.instance = this.createServiceChain();
        }
        return this.instance;
    }

    public static getNutritionAnalysisService(): import("../domain/services/NutritionAnalysisService").NutritionAnalysisService {
        if (this.nutritionInstance) {
            return this.nutritionInstance;
        }
        if (USE_MOCKS) {
            this.nutritionInstance = new MockNutritionAnalysisService();
            return this.nutritionInstance;
        }
        this.nutritionInstance = this.createNutritionServiceChain();
        return this.nutritionInstance;
    }

    public static async getImageRecognitionService(): Promise<ImageRecognitionService> {
        if (this.imageInstance) {
            return this.imageInstance;
        }
        if (USE_MOCKS) {
            this.imageInstance = new MockImageRecognitionService();
            return this.imageInstance;
        }
        this.imageInstance = await this.createImageServiceChain();
        return this.imageInstance;
    }

    public static getChatAssistantService(): ChatAssistantService {
        if (this.chatInstance) {
            return this.chatInstance;
        }
        if (USE_MOCKS) {
            this.chatInstance = new MockChatAssistantService();
            return this.chatInstance;
        }
        this.chatInstance = this.createChatServiceChain();
        return this.chatInstance;
    }

    public static getImageCompressionService(): ImageCompressionService {
        if (this.compressionInstance) {
            return this.compressionInstance;
        }
        this.compressionInstance = BrowserImageCompressionService.getInstance();
        return this.compressionInstance;
    }

    public static reset(): void {
        this.instance = null;
        this.nutritionInstance = null;
        this.imageInstance = null;
        this.chatInstance = null;
        this.compressionInstance = null;
    }

    private static createServiceChain(): FoodAnalysisService {
        const services: FoodAnalysisService[] = [];
        const savedKeys = this.loadKeys();

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
                    case 'openrouter':
                        services.push(new OpenRouterFoodAnalysisService(keyConfig.key));
                        break;
                }
            } catch (e) {
                console.error(`Failed to instantiate service for ${keyConfig.provider}`, e);
            }
        }

        console.log(`[ServiceFactory] Loaded ${services.length} services from user settings:`, savedKeys.map(k => k.provider));

        if (typeof window === 'undefined') {
            // Server-side: OpenRouter first, then Gemini as fallback
            if (env.OPENROUTER_API_KEY) {
                try {
                    services.push(new OpenRouterFoodAnalysisService(env.OPENROUTER_API_KEY));
                } catch (e) {
                    console.error('Failed to instantiate OpenRouterFoodAnalysisService', e);
                }
            }
            if (env.GEMINI_API_KEY) {
                try {
                    services.push(new GeminiFoodAnalysisService(env.GEMINI_API_KEY));
                } catch (e) {
                    console.error('Failed to instantiate GeminiFoodAnalysisService', e);
                }
            }
        } else {
            const authRepo = RepositoryFactory.getAuthRepository();
            services.push(new NextApiFoodAnalysisService(authRepo));
        }

        if (services.length === 0) console.warn("No AI services available.");
        return new FallbackFoodAnalysisService(services);
    }

    private static createNutritionServiceChain(): import("../domain/services/NutritionAnalysisService").NutritionAnalysisService {
        const services: import("../domain/services/NutritionAnalysisService").NutritionAnalysisService[] = [];
        const savedKeys = this.loadKeys();

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
                    case 'openrouter':
                        services.push(new OpenRouterNutritionAnalysisService(keyConfig.key));
                        break;
                }
            } catch (e) {
                console.error(`Failed to instantiate nutrition service for ${keyConfig.provider}`, e);
            }
        }

        if (typeof window === 'undefined') {
            // Server-side: OpenRouter first, then Gemini as fallback
            if (env.OPENROUTER_API_KEY) {
                try {
                    services.push(new OpenRouterNutritionAnalysisService(env.OPENROUTER_API_KEY));
                } catch (e) {
                    console.error('Failed to instantiate OpenRouterNutritionAnalysisService', e);
                }
            }
            if (env.GEMINI_API_KEY) {
                try {
                    services.push(new GeminiNutritionAnalysisService(env.GEMINI_API_KEY));
                } catch (e) {
                    console.error('Failed to instantiate GeminiNutritionAnalysisService', e);
                }
            }
        } else {
            const authRepo = RepositoryFactory.getAuthRepository();
            services.push(new NextApiNutritionAnalysisService(authRepo));
        }

        if (services.length === 0) console.warn("No Nutrition Analysis services available.");
        return new FallbackNutritionAnalysisService(services);
    }

    private static async createImageServiceChain(): Promise<ImageRecognitionService> {
        const services: ImageRecognitionService[] = [];
        const savedKeys = this.loadKeys();
        const modelRepo = RepositoryFactory.getModelConfigRepository();

        for (const keyConfig of savedKeys) {
            try {
                const model = await modelRepo.getModelVersion(keyConfig.provider, 'image');
                switch (keyConfig.provider) {
                    case 'gemini':
                        services.push(new GeminiImageRecognitionService(keyConfig.key, model));
                        break;
                    case 'openai':
                        services.push(new OpenAIImageRecognitionService(keyConfig.key, undefined, model));
                        break;
                    case 'deepseek':
                        services.push(new DeepSeekImageRecognitionService(keyConfig.key, model));
                        break;
                    case 'openrouter':
                        services.push(new OpenRouterImageRecognitionService(keyConfig.key, model));
                        break;
                }
            } catch (e) {
                console.error(`Failed to instantiate image service for ${keyConfig.provider}`, e);
            }
        }

        if (typeof window === 'undefined') {
            // Server-side: OpenRouter first, then Gemini as fallback
            if (env.OPENROUTER_API_KEY) {
                try {
                    const model = await modelRepo.getModelVersion('openrouter', 'image');
                    services.push(new OpenRouterImageRecognitionService(env.OPENROUTER_API_KEY, model));
                } catch (e) {
                    console.error('Failed to instantiate OpenRouterImageRecognitionService', e);
                }
            }
            if (env.GEMINI_API_KEY) {
                try {
                    const model = await modelRepo.getModelVersion('gemini', 'image');
                    services.push(new GeminiImageRecognitionService(env.GEMINI_API_KEY, model));
                } catch (e) {
                    console.error('Failed to instantiate GeminiImageRecognitionService', e);
                }
            }
        } else {
            const authRepo = RepositoryFactory.getAuthRepository();
            services.push(new NextApiImageRecognitionService(authRepo));
        }

        if (services.length === 0) console.warn("No Image Recognition services available.");
        return new FallbackImageRecognitionService(services);
    }

    private static createChatServiceChain(): ChatAssistantService {
        const savedKeys = this.loadKeys();

        for (const keyConfig of savedKeys) {
            try {
                switch (keyConfig.provider) {
                    case 'gemini':
                        return new GeminiChatAssistantService(keyConfig.key, RepositoryFactory.getDashboardRepository());
                    case 'deepseek':
                        return new DeepSeekChatAssistantService(keyConfig.key, RepositoryFactory.getDashboardRepository());
                    case 'openai':
                        return new OpenAIChatAssistantService(keyConfig.key, RepositoryFactory.getDashboardRepository());
                    case 'openrouter':
                        return new OpenRouterChatAssistantService(keyConfig.key, RepositoryFactory.getDashboardRepository());
                }
            } catch (e) {
                console.error(`Failed to instantiate chat service for ${keyConfig.provider}`, e);
            }
        }

        if (typeof window === 'undefined') {
            // Server-side: OpenRouter first, then Gemini as fallback
            const services: ChatAssistantService[] = [];
            if (env.OPENROUTER_API_KEY) {
                try {
                    services.push(new OpenRouterChatAssistantService(env.OPENROUTER_API_KEY, RepositoryFactory.getDashboardRepository()));
                } catch (e) {
                    console.error('Failed to instantiate OpenRouterChatAssistantService', e);
                }
            }
            if (env.GEMINI_API_KEY) {
                try {
                    services.push(new GeminiChatAssistantService(env.GEMINI_API_KEY, RepositoryFactory.getDashboardRepository()));
                } catch (e) {
                    console.error('Failed to instantiate GeminiChatAssistantService', e);
                }
            }
            if (services.length > 0) {
                return new FallbackChatAssistantService(services);
            }
            return new MockChatAssistantService();
        }

        const authRepo = RepositoryFactory.getAuthRepository();
        return new NextApiChatAssistantService(authRepo);
    }

    private static loadKeys(): ApiKey[] {
        if (typeof window !== 'undefined') {
            try {
                const item = localStorage.getItem('ai_api_keys');
                if (item) {
                    return JSON.parse(item);
                }
            } catch (e) {
                console.error("Failed to load API keys", e);
            }
        }
        return [];
    }
}
