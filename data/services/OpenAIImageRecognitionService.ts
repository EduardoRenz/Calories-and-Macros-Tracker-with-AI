import { ImageRecognitionService } from '../../domain/services/ImageRecognitionService';
import { Ingredient } from '../../domain/entities/dashboard';
import { InvalidApiKeyException, ImageTooLargeException, EmptyAnalysisResultException } from '../../domain/exceptions/ImageAnalysisException';

export class OpenAIImageRecognitionService extends ImageRecognitionService {
    private apiKey: string;
    private baseUrl: string;
    private model: string;

    constructor(apiKey: string, baseUrl: string = 'https://api.openai.com/v1', model: string = 'gpt-5.4-nano') {
        super();
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.model = model;
    }

    async analyzeMealImage(image: Blob, language: string, prompt?: string): Promise<Omit<Ingredient, 'id'>[]> {
        const base64Image = await this.blobToBase64(image);
        const defaultPrompt = this.buildDefaultPrompt(language);
        console.log(`[OpenAIImageRecognitionService] Analyzing image using model "${this.model}"`);

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
                if (response.status === 401 || errorData.includes('invalid_api_key') || errorData.includes('incorrect_api_key')) {
                    throw new InvalidApiKeyException('openai', errorData);
                }
                if (response.status === 413) {
                    throw new ImageTooLargeException(errorData);
                }
                throw new Error(`OpenAI API Error: ${response.status} - ${errorData}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;

            if (!content) throw new Error("Empty response from OpenAI");

            const result = JSON.parse(content);
            if (!result || !Array.isArray(result.ingredients) || result.ingredients.length === 0) {
                throw new EmptyAnalysisResultException();
            }
            return result.ingredients;
        } catch (error) {
            console.error("OpenAI Image Recognition Error:", error);

            if (error instanceof InvalidApiKeyException || error instanceof ImageTooLargeException || error instanceof EmptyAnalysisResultException) {
                throw error;
            }

            const message = error instanceof Error ? error.message : String(error);
            if (message.includes('413') || message.toLowerCase().includes('large') || message.toLowerCase().includes('too large')) {
                throw new ImageTooLargeException(message);
            }

            throw error;
        }
    }

    private async blobToBase64(blob: Blob): Promise<string> {
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64String = buffer.toString('base64');
        return base64String;
    }
}
