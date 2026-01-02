import { GoogleGenAI, Type } from "@google/genai";
import { FoodAnalysisInput } from '../../domain/services/FoodAnalysisService';
import { FoodAnalysisReport, VitaminStatus } from '../../domain/entities/analysis';
import { BaseFoodAnalysisService } from './BaseFoodAnalysisService';

export class GeminiFoodAnalysisService extends BaseFoodAnalysisService {
    private ai: GoogleGenAI;

    constructor(apiKey?: string) {
        super();
        const key = apiKey || process.env.GEMINI_API_KEY;
        if (!key) {
            throw new Error("Gemini API key not found");
        }
        this.ai = new GoogleGenAI({ apiKey: key });
    }

    async generateAnalysis(input: FoodAnalysisInput): Promise<FoodAnalysisReport> {
        // Use base class to generate the prompt text
        // Note: The base class buildPrompt asks for JSON. 
        // For Gemini SDK with typed schema, we still pass the text but might want to adjust if we rely purely on schema validation.
        // However, keeping the prompt consistent is good.
        // We will strip the "Respond ONLY with..." JSON part from the base prompt if we want to rely strictly on Gemini's Schema,
        // OR we just send the whole prompt and let Gemini handle it.
        // Given we want identical behavior, we can use the text from the base class but maybe we don't strictly *need* the schema text in the prompt if we pass responseSchema.
        // But adding it doesn't hurt.

        const prompt = this.buildPrompt(input);

        try {
            const response = await this.ai.models.generateContent({
                model: process.env.GEMINI_FAST_DEFAULT_MODEL || 'gemini-2.0-flash',
                contents: { parts: [{ text: prompt }] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            commonFoods: {
                                type: Type.OBJECT,
                                properties: {
                                    breakfast: {
                                        type: Type.OBJECT,
                                        properties: {
                                            foods: { type: Type.ARRAY, items: { type: Type.STRING } },
                                            consistency: { type: Type.NUMBER }
                                        },
                                        required: ["foods", "consistency"]
                                    },
                                    lunch: {
                                        type: Type.OBJECT,
                                        properties: {
                                            foods: { type: Type.ARRAY, items: { type: Type.STRING } },
                                            consistency: { type: Type.NUMBER }
                                        },
                                        required: ["foods", "consistency"]
                                    },
                                    dinner: {
                                        type: Type.OBJECT,
                                        properties: {
                                            foods: { type: Type.ARRAY, items: { type: Type.STRING } },
                                            consistency: { type: Type.NUMBER }
                                        },
                                        required: ["foods", "consistency"]
                                    },
                                    snacks: {
                                        type: Type.OBJECT,
                                        properties: {
                                            foods: { type: Type.ARRAY, items: { type: Type.STRING } },
                                            consistency: { type: Type.NUMBER }
                                        },
                                        required: ["foods", "consistency"]
                                    }
                                },
                                required: ["breakfast", "lunch", "dinner", "snacks"]
                            },
                            vitamins: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        status: { type: Type.STRING, enum: ["good", "low", "deficient"] },
                                        emoji: { type: Type.STRING },
                                        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        positiveReason: { type: Type.STRING }
                                    },
                                    required: ["name", "status"]
                                }
                            },
                            attentionPoints: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        severity: { type: Type.STRING, enum: ["warning", "alert"] },
                                        title: { type: Type.STRING },
                                        description: { type: Type.STRING }
                                    },
                                    required: ["severity", "title", "description"]
                                }
                            },
                            macroSuggestions: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        macro: { type: Type.STRING },
                                        current: { type: Type.NUMBER },
                                        goal: { type: Type.NUMBER },
                                        recommendations: {
                                            type: Type.ARRAY,
                                            items: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    meal: { type: Type.STRING },
                                                    food: { type: Type.STRING },
                                                    benefit: { type: Type.STRING }
                                                },
                                                required: ["meal", "food", "benefit"]
                                            }
                                        }
                                    },
                                    required: ["macro", "current", "goal", "recommendations"]
                                }
                            }
                        },
                        required: ["commonFoods", "vitamins", "attentionPoints", "macroSuggestions"]
                    }
                }
            });

            const jsonString = response.text;
            if (!jsonString) throw new Error("Empty response from Gemini");

            const result = JSON.parse(jsonString);

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
            console.error("Gemini Analysis Error:", error);
            throw error;
        }
    }
}
