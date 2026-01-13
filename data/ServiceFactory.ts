import { FoodAnalysisService } from '../domain/services/FoodAnalysisService';
import { GeminiFoodAnalysisService } from './services/GeminiFoodAnalysisService';
import { MockFoodAnalysisService } from './services/MockFoodAnalysisService';
import { OpenAIFoodAnalysisService } from './services/OpenAIFoodAnalysisService';
import { DeepSeekFoodAnalysisService } from './services/DeepSeekFoodAnalysisService';
import { FallbackFoodAnalysisService } from './services/FallbackFoodAnalysisService';
import { MockNutritionAnalysisService } from './services/MockNutritionAnalysisService';
import { MockImageRecognitionService } from './services/MockImageRecognitionService';
import { ChatAssistantService } from '../domain/services/ChatAssistantService';
import { MockChatAssistantService } from './services/MockChatAssistantService';
import { GeminiChatAssistantService } from './services/GeminiChatAssistantService';
import { OpenAIChatAssistantService } from './services/OpenAIChatAssistantService';
import { DeepSeekChatAssistantService } from './services/DeepSeekChatAssistantService';

import { GeminiNutritionAnalysisService } from './services/GeminiNutritionAnalysisService';
import { OpenAINutritionAnalysisService } from './services/OpenAINutritionAnalysisService';
import { DeepSeekNutritionAnalysisService } from './services/DeepSeekNutritionAnalysisService';
import { FallbackNutritionAnalysisService } from './services/FallbackNutritionAnalysisService';

import { ImageRecognitionService } from '../domain/services/ImageRecognitionService';
import { GeminiImageRecognitionService } from './services/GeminiImageRecognitionService';
import { OpenAIImageRecognitionService } from './services/OpenAIImageRecognitionService';
import { DeepSeekImageRecognitionService } from './services/DeepSeekImageRecognitionService';
import { FallbackImageRecognitionService } from './services/FallbackImageRecognitionService';

import { NextApiFoodAnalysisService } from './services/NextApiFoodAnalysisService';
import { NextApiNutritionAnalysisService } from './services/NextApiNutritionAnalysisService';
import { NextApiImageRecognitionService } from './services/NextApiImageRecognitionService';
import { NextApiChatAssistantService } from './services/NextApiChatAssistantService';

import { RepositoryFactory } from './RepositoryFactory';

const BACKEND_PROVIDER = process.env.BACKEND_PROVIDER ?? 'firebase';
const USE_MOCKS = BACKEND_PROVIDER === 'mock';

interface ApiKey {
    provider: 'gemini' | 'openai' | 'deepseek';
    key: string;
    addedAt: number;
}

export class ServiceFactory {
    private static instance: FoodAnalysisService | null = null;
    private static nutritionInstance: import("../domain/services/NutritionAnalysisService").NutritionAnalysisService | null = null;
    private static imageInstance: ImageRecognitionService | null = null;
    private static chatInstance: ChatAssistantService | null = null;

    public static getFoodAnalysisService(): FoodAnalysisService {
        if (USE_MOCKS) {
            return new MockFoodAnalysisService();
        }

        if (!this.instance) {
            this.instance = this.createServiceChain();
        }
        return this.instance;
    }

    public static getNutritionAnalysisService(): import("../domain/services/NutritionAnalysisService").NutritionAnalysisService {
        if (USE_MOCKS) {
            return new MockNutritionAnalysisService();
        }
        if (this.nutritionInstance) {
            return this.nutritionInstance;
        }
        this.nutritionInstance = this.createNutritionServiceChain();
        return this.nutritionInstance;
    }

    public static getImageRecognitionService(): ImageRecognitionService {
        if (USE_MOCKS) {
            return new MockImageRecognitionService();
        }
        if (this.imageInstance) {
            return this.imageInstance;
        }
        this.imageInstance = this.createImageServiceChain();
        return this.imageInstance;
    }

    public static getChatAssistantService(): ChatAssistantService {
        if (USE_MOCKS) {
            return new MockChatAssistantService();
        }
        if (this.chatInstance) {
            return this.chatInstance;
        }
        this.chatInstance = this.createChatServiceChain();
        return this.chatInstance;
    }

    public static reset(): void {
        this.instance = null;
        this.nutritionInstance = null;
        this.imageInstance = null;
        this.chatInstance = null;
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
                }
            } catch (e) {
                console.error(`Failed to instantiate service for ${keyConfig.provider}`, e);
            }
        }

        console.log(`[ServiceFactory] Loaded ${services.length} services from user settings:`, savedKeys.map(k => k.provider));

        if (typeof window !== 'undefined') {
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
                }
            } catch (e) {
                console.error(`Failed to instantiate nutrition service for ${keyConfig.provider}`, e);
            }
        }

        if (typeof window !== 'undefined') {
            const authRepo = RepositoryFactory.getAuthRepository();
            services.push(new NextApiNutritionAnalysisService(authRepo));
        }

        if (services.length === 0) console.warn("No Nutrition Analysis services available.");
        return new FallbackNutritionAnalysisService(services);
    }

    private static createImageServiceChain(): ImageRecognitionService {
        const services: ImageRecognitionService[] = [];
        const savedKeys = this.loadKeys();

        for (const keyConfig of savedKeys) {
            try {
                switch (keyConfig.provider) {
                    case 'gemini':
                        services.push(new GeminiImageRecognitionService(keyConfig.key));
                        break;
                    case 'openai':
                        services.push(new OpenAIImageRecognitionService(keyConfig.key));
                        break;
                    case 'deepseek':
                        services.push(new DeepSeekImageRecognitionService(keyConfig.key));
                        break;
                }
            } catch (e) {
                console.error(`Failed to instantiate image service for ${keyConfig.provider}`, e);
            }
        }

        if (typeof window !== 'undefined') {
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
                        return new GeminiChatAssistantService(keyConfig.key);
                    case 'deepseek':
                        return new DeepSeekChatAssistantService(keyConfig.key);
                    case 'openai':
                        return new OpenAIChatAssistantService(keyConfig.key);
                }
            } catch (e) {
                console.error(`Failed to instantiate chat service for ${keyConfig.provider}`, e);
            }
        }

        if (typeof window === 'undefined') {
            if (process.env.GEMINI_API_KEY) {
                return new GeminiChatAssistantService(process.env.GEMINI_API_KEY);
            }
            if (process.env.DEEPSEEK_API_KEY) {
                return new DeepSeekChatAssistantService(process.env.DEEPSEEK_API_KEY);
            }
            if (process.env.OPENAI_API_KEY) {
                return new OpenAIChatAssistantService(process.env.OPENAI_API_KEY);
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
