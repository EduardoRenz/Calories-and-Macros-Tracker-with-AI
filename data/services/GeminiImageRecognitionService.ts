import { GoogleGenAI, Type } from "@google/genai";
import { ImageRecognitionService } from '../../domain/services/ImageRecognitionService';
import type { Ingredient } from '../../domain/entities/dashboard';

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

export class GeminiImageRecognitionService implements ImageRecognitionService {
    private ai: GoogleGenAI;

    constructor(apiKey?: string) {
        const key = apiKey || process.env.GEMINI_API_KEY;
        if (!key) {
            throw new Error("GEMINI_API_KEY not set (neither in constructor nor environment).");
        }
        this.ai = new GoogleGenAI({ apiKey: key });
    }

    async analyzeMealImage(image: Blob, language: string): Promise<Omit<Ingredient, 'id'>[]> {
        try {
            const base64Data = await blobToBase64(image);

            const languageMap: { [key: string]: string } = {
                'en': 'English',
                'es': 'Spanish',
                'pt': 'Portuguese'
            };
            const languageName = languageMap[language] || 'English';

            const prompt = `Analyze the food items in this image. Provide a list of ingredients with their estimated quantity strictly in grams (e.g., "150g"), and nutritional information (calories, protein, carbs, fats, fiber) per serving. Name the ingredients in ${languageName}. Respond in JSON format according to the provided schema. If an item is unrecognizable, omit it from the list.`;

            const response = await this.ai.models.generateContent({
                model: process.env.GEMINI_FAST_DEFAULT_MODEL || 'gemini-2.5-flash',
                contents: {
                    parts: [
                        { text: prompt },
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
                                    },
                                    required: ["name", "quantity", "calories", "protein", "carbs", "fats", "fiber"]
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