import { NutritionAnalysisService, NutritionalInfo } from '../../domain/services/NutritionAnalysisService';

export class OpenAINutritionAnalysisService implements NutritionAnalysisService {
    private apiKey: string;
    private baseUrl: string;
    private model: string;

    constructor(apiKey: string, baseUrl: string = 'https://api.openai.com/v1', model: string = 'gpt-4o') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.model = model;
    }

    async getNutritionalInfo(ingredientName: string, quantity: string, language: string): Promise<NutritionalInfo | null> {
        const languageMap: { [key: string]: string } = {
            'en': 'English',
            'es': 'Spanish',
            'pt': 'Portuguese'
        };
        const languageName = languageMap[language] || 'English';

        const prompt = `Provide the estimated nutritional information (calories, protein, carbs, fats) for the following food item: "${quantity} of ${ingredientName}". 
        IMPORTANT: Estimate based on a typical plate size or serving if specific units are ambiguous.
        Also provide the estimated quantity in grams for the given amount.
        
        Respond ONLY with a valid JSON object (no markdown, no code blocks) matching this schema:
        {
            "calories": number, // kcal
            "protein": number, // grams
            "carbs": number, // grams
            "fats": number, // grams
            "quantityInGrams": number // grams
        }
        
        If you cannot determine the info, return 0 for all values.
        Respond in English regardless of the input language, but understand the food name in ${languageName}.`;

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

            if (result && typeof result.calories === 'number') {
                return result as NutritionalInfo;
            }

            return null;
        } catch (error) {
            console.error("OpenAI Nutrition Analysis Error:", error);
            throw error;
        }
    }
}
