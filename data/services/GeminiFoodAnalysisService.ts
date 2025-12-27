import { GoogleGenAI, Type } from "@google/genai";
import { FoodAnalysisService, FoodAnalysisInput } from '../../domain/services/FoodAnalysisService';
import { FoodAnalysisReport, VitaminStatus } from '../../domain/entities/analysis';

export class GeminiFoodAnalysisService implements FoodAnalysisService {
    private ai: GoogleGenAI;

    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY environment variable not set");
        }
        this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }

    async generateAnalysis(input: FoodAnalysisInput): Promise<FoodAnalysisReport> {
        const { dashboardData, profile, language } = input;

        const languageMap: { [key: string]: string } = {
            'en': 'English',
            'es': 'Spanish',
            'pt': 'Portuguese'
        };
        const languageName = languageMap[language] || 'English';

        // Consolidate meal data for the AI prompt
        const mealSummary = this.consolidateMealData(dashboardData);
        const dateRange = this.getDateRange(dashboardData);

        const prompt = `You are a nutrition expert AI assistant. Analyze the following meal data and provide a comprehensive nutrition report.

User Profile:
- Age: ${profile.personalInfo.age}
- Gender: ${profile.personalInfo.gender}
- Weight: ${profile.personalInfo.weight} kg
- Height: ${profile.personalInfo.height} cm
- Goal: ${profile.fitnessGoals.primaryGoal}
- Activity Level: ${profile.fitnessGoals.activityLevel}

Meal Data for the period (${dateRange.start} to ${dateRange.end}):
${mealSummary}

Please respond in ${languageName} with:
1. Most common foods for each meal (breakfast, lunch, dinner, snacks) with consistency percentage
2. Vitamin status analysis (A, C, D, Iron, Calcium, B12) - rate as 'good', 'low', or 'deficient'
3. Attention points - areas needing improvement
4. Macro suggestions with specific food recommendations

Respond ONLY with a JSON object matching the provided schema.`;

        const response = await this.ai.models.generateContent({
            model: process.env.GEMINI_FAST_DEFAULT_MODEL || 'gemini-3-flash-preview',
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
                                    status: { type: Type.STRING, enum: ["good", "low", "deficient"] }
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
        const result = JSON.parse(jsonString);

        return {
            generatedAt: new Date().toISOString(),
            dateRange,
            commonFoods: result.commonFoods,
            vitamins: result.vitamins.map((v: { name: string; status: string }) => ({
                name: v.name,
                status: v.status as VitaminStatus
            })),
            attentionPoints: result.attentionPoints,
            macroSuggestions: result.macroSuggestions
        };
    }

    private consolidateMealData(dashboardData: import("../../domain/entities/dashboard").DashboardData[]): string {
        const allMeals = {
            breakfast: [] as string[],
            lunch: [] as string[],
            dinner: [] as string[],
            snacks: [] as string[]
        };

        for (const day of dashboardData) {
            for (const [mealType, meal] of Object.entries(day.meals)) {
                const ingredients = meal.ingredients.map(ing => `${ing.name} (${ing.quantity})`);
                allMeals[mealType as keyof typeof allMeals].push(...ingredients);
            }
        }

        return Object.entries(allMeals)
            .map(([meal, foods]) => `${meal}: ${foods.length > 0 ? foods.join(', ') : 'No data'}`)
            .join('\n');
    }

    private getDateRange(dashboardData: import("../../domain/entities/dashboard").DashboardData[]): { start: string; end: string } {
        if (dashboardData.length === 0) {
            const today = new Date().toISOString().split('T')[0];
            return { start: today, end: today };
        }

        const dates = dashboardData.map(d => d.date).sort();
        return {
            start: dates[0],
            end: dates[dates.length - 1]
        };
    }
}
