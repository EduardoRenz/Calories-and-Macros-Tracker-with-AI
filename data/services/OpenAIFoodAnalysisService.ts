import { FoodAnalysisReport, VitaminStatus } from '../../domain/entities/analysis';
import { FoodAnalysisInput } from '../../domain/services/FoodAnalysisService';
import { BaseFoodAnalysisService } from './BaseFoodAnalysisService';
import { ModelConfigRepository } from '../../domain/repositories/ModelConfigRepository';
import { RepositoryFactory } from '../RepositoryFactory';

export class OpenAIFoodAnalysisService extends BaseFoodAnalysisService {
    private apiKey: string;
    private baseUrl: string;
    private model: string;
    private providerName: string;
    private modelConfigRepo: ModelConfigRepository;

    constructor(
        apiKey: string,
        baseUrl: string = 'https://api.openai.com/v1',
        model: string = 'gpt-5.4-nano',
        providerName: string = 'openai'
    ) {
        super();
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.model = model;
        this.providerName = providerName;
        this.modelConfigRepo = RepositoryFactory.getModelConfigRepository();
    }

    private async getModelVersion(): Promise<string> {
        try {
            return await this.modelConfigRepo.getModelVersion(this.providerName, 'food') || this.model;
        } catch (error) {
            console.warn(`Failed to get model version for ${this.providerName} from remote config, using fallback:`, error);
            return this.model;
        }
    }

    async generateAnalysis(input: FoodAnalysisInput): Promise<FoodAnalysisReport> {
        const prompt = this.buildPrompt(input);
        const currentModel = await this.getModelVersion();
        console.log(`[OpenAIFoodAnalysisService] Generating analysis with provider "${this.providerName}" using model "${currentModel}"`);

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: currentModel,
                    messages: [
                        { role: 'system', content: 'You are a helpful nutrition assistant that outputs JSON.' },
                        { role: 'user', content: prompt }
                    ],
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`OpenAI API Error: ${response.status} - ${errorData}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;

            if (!content) throw new Error("Empty response from OpenAI");

            const result = JSON.parse(content);

            return {
                generatedAt: new Date().toISOString(),
                dateRange: this.getDateRange(input.dashboardData),
                commonFoods: result.commonFoods,
                vitamins: result.vitamins.map((v: {
                    name: string;
                    status: string;
                    emoji?: string;
                    recommendations?: string[];
                    positiveReason?: string;
                }) => ({
                    name: v.name,
                    status: v.status as VitaminStatus,
                    emoji: v.emoji,
                    recommendations: v.recommendations,
                    positiveReason: v.positiveReason
                })),
                attentionPoints: result.attentionPoints,
                macroSuggestions: result.macroSuggestions
            };
        } catch (error) {
            console.error("OpenAI Analysis Error:", error);
            throw error;
        }
    }
}
