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
import { AiAccessService } from '../domain/services/AiAccessService';
import { DefaultAiAccessService } from './services/DefaultAiAccessService';


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
    private static aiAccessInstance: AiAccessService | null = null;


    public static async getFoodAnalysisService(priorityList?: string[]): Promise<FoodAnalysisService> {
        // Skip cache if priorityList is provided to allow dynamic updates from feature flag
        if (!priorityList && this.instance) {
            return this.instance;
        }
        if (USE_MOCKS) {
            const mockService = new MockFoodAnalysisService();
            if (!priorityList) this.instance = mockService;
            return mockService;
        }

        const service = await this.createServiceChain(priorityList);
        if (!priorityList) {
            this.instance = service;
        }
        return service;
    }

    public static async getNutritionAnalysisService(priorityList?: string[]): Promise<import("../domain/services/NutritionAnalysisService").NutritionAnalysisService> {
        // Skip cache if priorityList is provided to allow dynamic updates from feature flag
        if (!priorityList && this.nutritionInstance) {
            return this.nutritionInstance;
        }
        if (USE_MOCKS) {
            const mockService = new MockNutritionAnalysisService();
            if (!priorityList) this.nutritionInstance = mockService;
            return mockService;
        }
        const service = await this.createNutritionServiceChain(priorityList);
        if (!priorityList) {
            this.nutritionInstance = service;
        }
        return service;
    }

    public static async getImageRecognitionService(priorityList?: string[]): Promise<ImageRecognitionService> {
        // Skip cache if priorityList is provided to allow dynamic updates from feature flag
        if (!priorityList && this.imageInstance) {
            return this.imageInstance;
        }
        if (USE_MOCKS) {
            const mockService = new MockImageRecognitionService();
            if (!priorityList) this.imageInstance = mockService;
            return mockService;
        }
        const service = await this.createImageServiceChain(priorityList);
        if (!priorityList) {
            this.imageInstance = service;
        }
        return service;
    }

    public static async getChatAssistantService(priorityList?: string[]): Promise<ChatAssistantService> {
        // Skip cache if priorityList is provided to allow dynamic updates from feature flag
        if (!priorityList && this.chatInstance) {
            return this.chatInstance;
        }
        if (USE_MOCKS) {
            const mockService = new MockChatAssistantService();
            if (!priorityList) this.chatInstance = mockService;
            return mockService;
        }
        const service = await this.createChatServiceChain(priorityList);
        if (!priorityList) {
            this.chatInstance = service;
        }
        return service;
    }

    public static getImageCompressionService(): ImageCompressionService {
        if (this.compressionInstance) {
            return this.compressionInstance;
        }
        this.compressionInstance = BrowserImageCompressionService.getInstance();
        return this.compressionInstance;
    }

    public static getAiAccessService(): AiAccessService {
        if (this.aiAccessInstance) {
            return this.aiAccessInstance;
        }
        this.aiAccessInstance = DefaultAiAccessService.getInstance(
            RepositoryFactory.getFeatureFlagRepository(),
            RepositoryFactory.getSubscriptionRepository(),
            RepositoryFactory.getUserApiKeysRepository()
        );
        return this.aiAccessInstance;
    }

    public static reset(): void {
        this.instance = null;
        this.nutritionInstance = null;
        this.imageInstance = null;
        this.chatInstance = null;
        this.compressionInstance = null;
        this.aiAccessInstance = null;
    }

    private static async createServiceChain(priorityList?: string[]): Promise<FoodAnalysisService> {
        const services: FoodAnalysisService[] = [];
        const addedProviders = new Set<string>();
        const savedKeys = this.loadKeys();

        for (const keyConfig of savedKeys) {
            // Skip if this provider is already added (user keys take priority)
            if (addedProviders.has(keyConfig.provider)) {
                console.log(`[ServiceFactory] Skipping duplicate provider from user keys: ${keyConfig.provider}`);
                continue;
            }
            try {
                switch (keyConfig.provider) {
                    case 'gemini':
                        services.push(new GeminiFoodAnalysisService(keyConfig.key));
                        addedProviders.add('gemini');
                        break;
                    case 'openai':
                        services.push(new OpenAIFoodAnalysisService(keyConfig.key));
                        addedProviders.add('openai');
                        break;
                    case 'deepseek':
                        services.push(new DeepSeekFoodAnalysisService(keyConfig.key));
                        addedProviders.add('deepseek');
                        break;
                    case 'openrouter':
                        services.push(new OpenRouterFoodAnalysisService(keyConfig.key));
                        addedProviders.add('openrouter');
                        break;
                }
            } catch (e) {
                console.error(`Failed to instantiate service for ${keyConfig.provider}`, e);
            }
        }

        console.log(`[ServiceFactory] Loaded ${services.length} services from user settings:`, Array.from(addedProviders));

        if (typeof window === 'undefined') {
            // Server-side: use priority list from parameter or default, skip duplicates
            const effectivePriorityList = priorityList?.length ? priorityList : ['openai', 'openrouter', 'gemini'];
            const serverServices = await this.instantiateServerServicesByPriority(
                effectivePriorityList.filter(p => !addedProviders.has(p)),
                'food'
            );
            services.push(...serverServices as FoodAnalysisService[]);
        } else {
            const authRepo = RepositoryFactory.getAuthRepository();
            services.push(new NextApiFoodAnalysisService(authRepo));
        }

        if (services.length === 0) console.warn("No AI services available.");
        return new FallbackFoodAnalysisService(services);
    }

    private static async createNutritionServiceChain(priorityList?: string[]): Promise<import("../domain/services/NutritionAnalysisService").NutritionAnalysisService> {
        const services: import("../domain/services/NutritionAnalysisService").NutritionAnalysisService[] = [];
        const addedProviders = new Set<string>();
        const savedKeys = this.loadKeys();

        for (const keyConfig of savedKeys) {
            // Skip if this provider is already added (user keys take priority)
            if (addedProviders.has(keyConfig.provider)) {
                console.log(`[ServiceFactory] Skipping duplicate nutrition provider from user keys: ${keyConfig.provider}`);
                continue;
            }
            try {
                switch (keyConfig.provider) {
                    case 'gemini':
                        services.push(new GeminiNutritionAnalysisService(keyConfig.key));
                        addedProviders.add('gemini');
                        break;
                    case 'openai':
                        services.push(new OpenAINutritionAnalysisService(keyConfig.key));
                        addedProviders.add('openai');
                        break;
                    case 'deepseek':
                        services.push(new DeepSeekNutritionAnalysisService(keyConfig.key));
                        addedProviders.add('deepseek');
                        break;
                    case 'openrouter':
                        services.push(new OpenRouterNutritionAnalysisService(keyConfig.key));
                        addedProviders.add('openrouter');
                        break;
                }
            } catch (e) {
                console.error(`Failed to instantiate nutrition service for ${keyConfig.provider}`, e);
            }
        }

        if (typeof window === 'undefined') {
            // Server-side: use priority list from parameter or default, skip duplicates
            const effectivePriorityList = priorityList?.length ? priorityList : ['openai', 'openrouter', 'gemini'];
            const serverServices = await this.instantiateServerServicesByPriority(
                effectivePriorityList.filter(p => !addedProviders.has(p)),
                'nutrition'
            );
            services.push(...serverServices as import("../domain/services/NutritionAnalysisService").NutritionAnalysisService[]);
        } else {
            const authRepo = RepositoryFactory.getAuthRepository();
            services.push(new NextApiNutritionAnalysisService(authRepo));
        }

        if (services.length === 0) console.warn("No Nutrition Analysis services available.");
        return new FallbackNutritionAnalysisService(services);
    }

    private static async createImageServiceChain(priorityList?: string[]): Promise<ImageRecognitionService> {
        const services: ImageRecognitionService[] = [];
        const addedProviders = new Set<string>();
        const savedKeys = this.loadKeys();
        const modelRepo = RepositoryFactory.getModelConfigRepository();

        for (const keyConfig of savedKeys) {
            // Skip if this provider is already added (user keys take priority)
            if (addedProviders.has(keyConfig.provider)) {
                console.log(`[ServiceFactory] Skipping duplicate image provider from user keys: ${keyConfig.provider}`);
                continue;
            }
            try {
                const model = await modelRepo.getModelVersion(keyConfig.provider, 'image');
                switch (keyConfig.provider) {
                    case 'gemini':
                        services.push(new GeminiImageRecognitionService(keyConfig.key, model));
                        addedProviders.add('gemini');
                        break;
                    case 'openai':
                        services.push(new OpenAIImageRecognitionService(keyConfig.key, undefined, model));
                        addedProviders.add('openai');
                        break;
                    case 'deepseek':
                        services.push(new DeepSeekImageRecognitionService(keyConfig.key, model));
                        addedProviders.add('deepseek');
                        break;
                    case 'openrouter':
                        services.push(new OpenRouterImageRecognitionService(keyConfig.key, model));
                        addedProviders.add('openrouter');
                        break;
                }
            } catch (e) {
                console.error(`Failed to instantiate image service for ${keyConfig.provider}`, e);
            }
        }

        if (typeof window === 'undefined') {
            // Server-side: use priority list from parameter or default, skip duplicates
            const effectivePriorityList = priorityList?.length ? priorityList : ['openai', 'openrouter', 'gemini'];
            const serverServices = await this.instantiateServerServicesByPriority(
                effectivePriorityList.filter(p => !addedProviders.has(p)),
                'image',
                modelRepo
            );
            services.push(...serverServices as ImageRecognitionService[]);
        } else {
            const authRepo = RepositoryFactory.getAuthRepository();
            services.push(new NextApiImageRecognitionService(authRepo));
        }

        if (services.length === 0) console.warn("No Image Recognition services available.");
        return new FallbackImageRecognitionService(services);
    }

    private static async createChatServiceChain(priorityList?: string[]): Promise<ChatAssistantService> {
        const services: ChatAssistantService[] = [];
        const addedProviders = new Set<string>();
        const savedKeys = this.loadKeys();

        for (const keyConfig of savedKeys) {
            // Skip if this provider is already added (user keys take priority)
            if (addedProviders.has(keyConfig.provider)) {
                console.log(`[ServiceFactory] Skipping duplicate chat provider from user keys: ${keyConfig.provider}`);
                continue;
            }
            try {
                switch (keyConfig.provider) {
                    case 'gemini':
                        services.push(new GeminiChatAssistantService(keyConfig.key, RepositoryFactory.getDashboardRepository()));
                        addedProviders.add('gemini');
                        break;
                    case 'deepseek':
                        services.push(new DeepSeekChatAssistantService(keyConfig.key, RepositoryFactory.getDashboardRepository()));
                        addedProviders.add('deepseek');
                        break;
                    case 'openai':
                        services.push(new OpenAIChatAssistantService(keyConfig.key, RepositoryFactory.getDashboardRepository()));
                        addedProviders.add('openai');
                        break;
                    case 'openrouter':
                        services.push(new OpenRouterChatAssistantService(keyConfig.key, RepositoryFactory.getDashboardRepository()));
                        addedProviders.add('openrouter');
                        break;
                }
            } catch (e) {
                console.error(`Failed to instantiate chat service for ${keyConfig.provider}`, e);
            }
        }

        console.log(`[ServiceFactory] Loaded ${services.length} chat services from user settings:`, Array.from(addedProviders));

        if (typeof window === 'undefined') {
            // Server-side: use priority list from parameter or default, skip duplicates
            const effectivePriorityList = priorityList?.length ? priorityList : ['openai', 'openrouter', 'gemini'];
            const serverServices = await this.instantiateServerServicesByPriority(
                effectivePriorityList.filter(p => !addedProviders.has(p)),
                'chat'
            );
            services.push(...serverServices as ChatAssistantService[]);
        } else {
            const authRepo = RepositoryFactory.getAuthRepository();
            services.push(new NextApiChatAssistantService(authRepo));
        }

        if (services.length === 0) {
            console.warn("No Chat Assistant services available.");
            return new MockChatAssistantService();
        }
        return new FallbackChatAssistantService(services);
    }

    /**
     * Instantiates server-side AI services based on priority list.
     * Filters out providers without corresponding environment variables.
     */
    private static async instantiateServerServicesByPriority(
        priorityList: string[],
        serviceType: 'food' | 'nutrition' | 'image' | 'chat',
        modelRepo?: { getModelVersion: (provider: string, type: string) => Promise<string> }
    ): Promise<Array<FoodAnalysisService | import("../domain/services/NutritionAnalysisService").NutritionAnalysisService | ImageRecognitionService | ChatAssistantService>> {
        const services: Array<FoodAnalysisService | import("../domain/services/NutritionAnalysisService").NutritionAnalysisService | ImageRecognitionService | ChatAssistantService> = [];
        const dashboardRepo = RepositoryFactory.getDashboardRepository();

        for (const provider of priorityList) {
            try {
                switch (provider) {
                    case 'openrouter':
                        if (env.OPENROUTER_API_KEY) {
                            switch (serviceType) {
                                case 'food':
                                    services.push(new OpenRouterFoodAnalysisService(env.OPENROUTER_API_KEY));
                                    break;
                                case 'nutrition':
                                    services.push(new OpenRouterNutritionAnalysisService(env.OPENROUTER_API_KEY));
                                    break;
                                case 'image':
                                    if (modelRepo) {
                                        const model = await modelRepo.getModelVersion('openrouter', 'image');
                                        services.push(new OpenRouterImageRecognitionService(env.OPENROUTER_API_KEY, model));
                                    }
                                    break;
                                case 'chat':
                                    services.push(new OpenRouterChatAssistantService(env.OPENROUTER_API_KEY, dashboardRepo));
                                    break;
                            }
                        }
                        break;
                    case 'gemini':
                        if (env.GEMINI_API_KEY) {
                            switch (serviceType) {
                                case 'food':
                                    services.push(new GeminiFoodAnalysisService(env.GEMINI_API_KEY));
                                    break;
                                case 'nutrition':
                                    services.push(new GeminiNutritionAnalysisService(env.GEMINI_API_KEY));
                                    break;
                                case 'image':
                                    if (modelRepo) {
                                        const model = await modelRepo.getModelVersion('gemini', 'image');
                                        services.push(new GeminiImageRecognitionService(env.GEMINI_API_KEY, model));
                                    }
                                    break;
                                case 'chat':
                                    services.push(new GeminiChatAssistantService(env.GEMINI_API_KEY, dashboardRepo));
                                    break;
                            }
                        }
                        break;
                    case 'openai':
                        if (env.OPENAI_API_KEY) {
                            switch (serviceType) {
                                case 'food':
                                    services.push(new OpenAIFoodAnalysisService(env.OPENAI_API_KEY));
                                    break;
                                case 'nutrition':
                                    services.push(new OpenAINutritionAnalysisService(env.OPENAI_API_KEY));
                                    break;
                                case 'image':
                                    if (modelRepo) {
                                        const model = await modelRepo.getModelVersion('openai', 'image');
                                        services.push(new OpenAIImageRecognitionService(env.OPENAI_API_KEY, undefined, model));
                                    }
                                    break;
                                case 'chat':
                                    services.push(new OpenAIChatAssistantService(env.OPENAI_API_KEY, dashboardRepo));
                                    break;
                            }
                        }
                        break;
                    case 'deepseek':
                        if (env.DEEPSEEK_API_KEY) {
                            switch (serviceType) {
                                case 'food':
                                    services.push(new DeepSeekFoodAnalysisService(env.DEEPSEEK_API_KEY));
                                    break;
                                case 'nutrition':
                                    services.push(new DeepSeekNutritionAnalysisService(env.DEEPSEEK_API_KEY));
                                    break;
                                case 'image':
                                    // DeepSeek doesn't support image recognition - skip to avoid wasting time
                                    console.log('[ServiceFactory] Skipping DeepSeek for image recognition (not supported)');
                                    break;
                                case 'chat':
                                    services.push(new DeepSeekChatAssistantService(env.DEEPSEEK_API_KEY, dashboardRepo));
                                    break;
                            }
                        }
                        break;
                }
            } catch (e) {
                console.error(`[ServiceFactory] Failed to instantiate ${provider} ${serviceType} service:`, e);
            }
        }

        return services;
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
