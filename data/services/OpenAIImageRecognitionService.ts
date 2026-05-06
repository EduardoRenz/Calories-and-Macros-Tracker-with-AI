import { ImageRecognitionService } from '../../domain/services/ImageRecognitionService';
import { Ingredient } from '../../domain/entities/dashboard';

export class OpenAIImageRecognitionService extends ImageRecognitionService {
    private apiKey: string;
    private baseUrl: string;
    private model: string;

    constructor(apiKey: string, baseUrl: string = 'https://api.openai.com/v1', model: string = 'gpt-4o') {
        super();
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.model = model;
    }

    async analyzeMealImage(image: Blob, language: string, prompt?: string): Promise<Omit<Ingredient, 'id'>[]> {
        const base64Image = await this.blobToBase64(image);
        const defaultPrompt = this.buildDefaultPrompt(language);

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
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: prompt ? `${prompt}\n\n${defaultPrompt}` : defaultPrompt
                                },
                                {
                                    type: 'image_url',
                                    image_url: {
                                        url: `data:image/jpeg;base64,${base64Image}`
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
            return result.ingredients;
        } catch (error) {
            console.error("OpenAI Image Recognition Error:", error);
            throw error;
        }
    }

    private async blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                // Remove potential metadata prefix (data:image/jpeg;base64,)
                const base64Data = base64String.split(',')[1] || base64String;
                resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
}
