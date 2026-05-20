import { GoogleGenAI, Type } from "@google/genai";
import { ImageRecognitionService } from '../../domain/services/ImageRecognitionService';
import type { Ingredient } from '../../domain/entities/dashboard';
import { env } from '../../env';
import { FOOD_CATEGORIES_LIST } from "../../domain/constants/foodCategories";

const blobToBase64 = async (blob: Blob): Promise<string> => {
    // Check if we are in a browser environment
    if (typeof window !== 'undefined' && typeof FileReader !== 'undefined') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result.split(',')[1]);
                } else {
                    reject(new Error('Failed to convert blob to base64'));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } else {
        // Node.js / Server environment
        const buffer = Buffer.from(await blob.arrayBuffer());
        return buffer.toString('base64');
    }
};

export class GeminiImageRecognitionService extends ImageRecognitionService {
    private ai: GoogleGenAI;
    private model: string;

    constructor(apiKey?: string, model?: string) {
        super();
        const key = apiKey || (typeof window === 'undefined' ? env.GEMINI_API_KEY : '');
        this.ai = new GoogleGenAI({ apiKey: key || '' });
        this.model = model || env.NEXT_PUBLIC_GEMINI_FAST_DEFAULT_MODEL || 'gemini-3-flash-preview';
    }

    async analyzeMealImage(image: Blob, language: string, prompt?: string): Promise<Omit<Ingredient, 'id'>[]> {
        try {
            const base64Data = await blobToBase64(image);
            const defaultPrompt = this.buildDefaultPrompt(language);

            const promptText = prompt ? `${prompt}\n\n${defaultPrompt}` : defaultPrompt;

            const response = await this.ai.models.generateContent({
                model: this.model,
                contents: {
                    parts: [
                        { text: promptText },
                        { inlineData: { mimeType: image.type, data: base64Data } }
                    ]
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            ingredients: {
                                type: Type.ARRAY,
                                description: "List of identified ingredients and their nutritional info.",
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING, description: "Name of the ingredient." },
                                        quantity: { type: Type.STRING, description: "Estimated quantity in grams (e.g., '150g'). The value must be a string ending with 'g'." },
                                        calories: { type: Type.NUMBER, description: "Estimated calories (kcal)." },
                                        protein: { type: Type.NUMBER, description: "Estimated protein (g)." },
                                        carbs: { type: Type.NUMBER, description: "Estimated carbohydrates (g)." },
                                        fats: { type: Type.NUMBER, description: "Estimated fats (g)." },
                                        fiber: { type: Type.NUMBER, description: "Estimated fiber (g)." },
                                        category: { type: Type.STRING, description: `Food category. Must be one of: ${FOOD_CATEGORIES_LIST.join(', ')}` },
                                    },
                                    required: ["name", "quantity", "calories", "protein", "carbs", "fats", "fiber", "category"]
                                }
                            }
                        },
                        required: ["ingredients"]
                    }
                }
            });

            const jsonString = response.text;
            if (!jsonString) throw new Error("Empty response from Gemini");
            const result = JSON.parse(jsonString);

            if (result.ingredients && Array.isArray(result.ingredients)) {
                return result.ingredients;
            }

            return [];
        } catch (err) {
            console.error("Gemini API Error in GeminiImageRecognitionService:", err);
            // Re-throw the error to be handled by the caller
            throw new Error("Failed to analyze image with Gemini API.");
        }
    }
}
