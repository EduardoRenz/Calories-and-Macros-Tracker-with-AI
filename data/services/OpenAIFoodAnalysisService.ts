import { FoodAnalysisReport, VitaminStatus } from '../../domain/entities/analysis';
import { FoodAnalysisInput } from '../../domain/services/FoodAnalysisService';
import { BaseFoodAnalysisService } from './BaseFoodAnalysisService';

export class OpenAIFoodAnalysisService extends BaseFoodAnalysisService {
    private apiKey: string;
    private baseUrl: string;
    private model: string;

    constructor(apiKey: string, baseUrl: string = 'https://api.openai.com/v1', model: string = 'gpt-4o') {
        super();
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.model = model;
    }

    async generateAnalysis(input: FoodAnalysisInput): Promise<FoodAnalysisReport> {
        const prompt = this.buildPrompt(input);

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
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
                vitamins: result.vitamins.map((v: { name: string; status: string }) => ({
                    name: v.name,
                    status: v.status as VitaminStatus
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
