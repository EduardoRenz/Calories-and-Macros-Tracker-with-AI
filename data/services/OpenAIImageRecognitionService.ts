import { ImageRecognitionService } from '../../domain/services/ImageRecognitionService';
import { Ingredient } from '../../domain/entities/dashboard';

const blobToBase64 = (blob: Blob): Promise<string> => {
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
};

export class OpenAIImageRecognitionService implements ImageRecognitionService {
    private apiKey: string;
    private baseUrl: string;
    private model: string;

    constructor(apiKey: string, baseUrl: string = 'https://api.openai.com/v1', model: string = 'gpt-4o') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.model = model;
    }

    async analyzeMealImage(image: Blob, language: string): Promise<Omit<Ingredient, 'id'>[]> {
        const base64Image = await blobToBase64(image);

        const languageMap: { [key: string]: string } = {
            'en': 'English',
            'es': 'Spanish',
            'pt': 'Portuguese'
        };
        const languageName = languageMap[language] || 'English';

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
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: `Analyze the food items in this image. 
                                    Provide a list of ingredients with their estimated quantity strictly in grams (e.g., "150g"), 
                                    and nutritional information (calories, protein, carbs, fats, fiber) per serving. 
                                    Name the ingredients in ${languageName}. 
                                    
                                    Respond ONLY with a valid JSON object matching this schema:
                                    {
                                        "ingredients": [
                                            {
                                                "name": "string",
                                                "quantity": "string", // e.g. "150g"
                                                "calories": number,
                                                "protein": number,
                                                "carbs": number,
                                                "fats": number,
                                                "fiber": number
                                            }
                                        ]
                                    }
                                    
                                    If an item is unrecognizable, omit it.`
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:${image.type};base64,${base64Image}`
                                    }
                                }
                            ]
                        }
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

            if (result.ingredients && Array.isArray(result.ingredients)) {
                return result.ingredients;
            }

            return [];
        } catch (error) {
            console.error("OpenAI Image Recognition Error:", error);
            throw error;
        }
    }
}
