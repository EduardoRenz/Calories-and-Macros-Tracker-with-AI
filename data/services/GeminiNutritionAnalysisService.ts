import { GoogleGenAI, Type } from "@google/genai";
import { NutritionAnalysisService, NutritionalInfo } from '../../domain/services/NutritionAnalysisService';

export class GeminiNutritionAnalysisService implements NutritionAnalysisService {
    private ai: GoogleGenAI;

    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY environment variable not set");
        }
        this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }

    async getNutritionalInfo(ingredientName: string, quantity: string, language: string): Promise<NutritionalInfo | null> {
        try {
            const languageMap: { [key: string]: string } = {
                'en': 'English',
                'es': 'Spanish',
                'pt': 'Portuguese'
            };
            const languageName = languageMap[language] || 'English';

            const prompt = `Provide the estimated nutritional information (calories, protein, carbs, fats) for the following food item: "${quantity} of ${ingredientName}". Respond ONLY with a JSON object matching the provided schema. If you cannot determine the nutritional information, return an object with zero for all values. Important: estimate based on a plate size, if you don't know how to estimate the size and amount of an ingredient, estimate based on an average per serving.`;

            const response = await this.ai.models.generateContent({
                model: process.env.GEMINI_FAST_DEFAULT_MODEL || 'gemini-3-flash-preview',
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
                        },
                        required: ["calories", "protein", "carbs", "fats"]
                    }
                }
            });

            const jsonString = response.text;
            const result = JSON.parse(jsonString);

            if (result && typeof result.calories === 'number') {
                return result as NutritionalInfo;
            }

            return null;
        } catch (err) {
            console.error("Gemini API Error in GeminiNutritionAnalysisService:", err);
            return null;
        }
    }
}
