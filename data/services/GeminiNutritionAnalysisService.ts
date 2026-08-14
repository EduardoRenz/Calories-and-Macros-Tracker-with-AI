import { GoogleGenAI, Type } from "@google/genai";
import { NutritionAnalysisService, NutritionalInfo } from '../../domain/services/NutritionAnalysisService';
import { env } from '../../env';
import { FOOD_CATEGORIES_LIST } from "../../domain/constants/foodCategories";
import { InvalidApiKeyException, RateLimitedException } from '../../domain/exceptions/ImageAnalysisException';

export class GeminiNutritionAnalysisService extends NutritionAnalysisService {
    private ai: GoogleGenAI;

    constructor(apiKey?: string) {
        super();
        const key = apiKey || env.GEMINI_API_KEY;
        if (!key) {
            throw new Error("GEMINI_API_KEY not set (neither in constructor nor environment).");
        }
        this.ai = new GoogleGenAI({ apiKey: key });
    }

    async getNutritionalInfo(ingredientName: string, quantity: string, language: string): Promise<NutritionalInfo | null> {
        try {
            const prompt = this.buildNutritionPrompt(ingredientName, quantity, language);

            const response = await this.ai.models.generateContent({
                model: env.NEXT_PUBLIC_GEMINI_FAST_DEFAULT_MODEL || 'gemini-3-flash-preview',
                contents: { parts: [{ text: prompt }] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            calories: { type: Type.NUMBER, description: "Estimated calories (kcal)." },
                            protein: { type: Type.NUMBER, description: "Estimated protein (g)." },
                            carbs: { type: Type.NUMBER, description: "Estimated carbohydrates (g)." },
                            fats: { type: Type.NUMBER, description: "Estimated fats (g)." },
                            fiber: { type: Type.NUMBER, description: "Estimated fiber (g)." },
                            quantityInGrams: { type: Type.NUMBER, description: "Estimated quantity of the food item in grams." },
                            category: { type: Type.STRING, description: `Food category. Must be one of: ${FOOD_CATEGORIES_LIST.join(', ')}` },
                        },
                        required: ["calories", "protein", "carbs", "fats", "fiber", "quantityInGrams", "category"]
                    }
                }
            });

            const jsonString = response.text;
            if (!jsonString) throw new Error("Empty response from Gemini");
            const result = JSON.parse(jsonString);

            if (result && typeof result.calories === 'number') {
                return result as NutritionalInfo;
            }

            return null;
        } catch (err) {
            console.error("Gemini API Error in GeminiNutritionAnalysisService:", err);

            if (err instanceof InvalidApiKeyException || err instanceof RateLimitedException) {
                throw err;
            }

            const message = err instanceof Error ? err.message : String(err);
            if (message.includes('API_KEY_INVALID') || message.includes('API key not valid') || message.includes('not authorized') || message.includes('api_key_invalid')) {
                throw new InvalidApiKeyException('gemini', message);
            }
            if (message.includes('RESOURCE_EXHAUSTED') || message.includes('quota') || message.includes('rate limit') || message.includes('429')) {
                throw new RateLimitedException(message);
            }

            throw err;
        }
    }
}
