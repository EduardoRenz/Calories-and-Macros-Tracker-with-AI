import { NutritionAnalysisService, NutritionalInfo } from '../../domain/services/NutritionAnalysisService';
import { InvalidApiKeyException, RateLimitedException } from '../../domain/exceptions/ImageAnalysisException';

export class OpenAINutritionAnalysisService extends NutritionAnalysisService {
    private apiKey: string;
    private baseUrl: string;
    private model: string;

    constructor(apiKey: string, baseUrl: string = 'https://api.openai.com/v1', model: string = 'gpt-5.4-nano', private providerName: string = 'openai') {
        super();
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.model = model;
    }

    async getNutritionalInfo(ingredientName: string, quantity: string, language: string): Promise<NutritionalInfo | null> {
        const prompt = this.buildNutritionPrompt(ingredientName, quantity, language);

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
                if (response.status === 401 || errorData.includes('invalid_api_key') || errorData.includes('incorrect_api_key')) {
                    throw new InvalidApiKeyException(this.providerName, errorData);
                }
                if (response.status === 429) {
                    throw new RateLimitedException(errorData);
                }
                throw new Error(`OpenAI API Error: ${response.status} - ${errorData}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;

            if (!content) throw new Error("Empty response from OpenAI");

            const result = JSON.parse(content);

            if (result && typeof result.calories === 'number') {
                return result as NutritionalInfo;
            }

            return null;
        } catch (error) {
            console.error("OpenAI Nutrition Analysis Error:", error);

            if (error instanceof InvalidApiKeyException || error instanceof RateLimitedException) {
                throw error;
            }

            const message = error instanceof Error ? error.message : String(error);
            if (message.includes('429') || message.toLowerCase().includes('quota') || message.toLowerCase().includes('rate limit')) {
                throw new RateLimitedException(message);
            }

            throw error;
        }
    }
}
