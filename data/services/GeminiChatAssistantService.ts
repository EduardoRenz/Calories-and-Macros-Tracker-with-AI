import { FunctionCallingConfigMode, GoogleGenAI, Type } from "@google/genai";
import { ChatAssistantContextData } from '../../domain/services/ChatAssistantService';
import { BaseChatAssistantService } from './BaseChatAssistantService';
import { ChatMessage } from '../../domain/entities/ChatMessage';
import { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import { ModelConfigRepository } from '../../domain/repositories/ModelConfigRepository';
import { RepositoryFactory } from '../RepositoryFactory';
import { env } from '../../env';
import en from '../../locales/en';
import pt from '../../locales/pt';
import es from '../../locales/es';

export class GeminiChatAssistantService extends BaseChatAssistantService {
    private ai: GoogleGenAI;
    private model: string = env.GEMINI_FAST_DEFAULT_MODEL || 'gemini-2.5-flash-lite';
    private modelConfigRepo: ModelConfigRepository;

    constructor(apiKey?: string, private dashboardRepo?: DashboardRepository) {
        super();
        this.modelConfigRepo = RepositoryFactory.getModelConfigRepository();
        const key = apiKey || env.GEMINI_API_KEY;
        if (!key) {
            console.error("Gemini API key not found. Chat Assistant will fail.");
        }
        this.ai = new GoogleGenAI({ apiKey: key || 'dummy' });
    }

    private async getModelVersion(): Promise<string> {
        try {
            return await this.modelConfigRepo.getModelVersion('gemini', 'chat')
                || env.GEMINI_FAST_DEFAULT_MODEL
                || 'gemini-2.5-flash-lite';
        } catch (error) {
            console.warn('Failed to get model version from remote config, using fallback:', error);
            return env.GEMINI_FAST_DEFAULT_MODEL || 'gemini-2.5-flash-lite';
        }
    }

    async sendMessage(messages: ChatMessage[], context: ChatAssistantContextData): Promise<ChatMessage> {
        // Construct the prompt manually using Base parts, BUT skipping getOutputInstructions (JSON)
        // because we want to use Tools.

        let systemPrompt = `${this.getPersonaHeader()}

${this.buildContextString(context)}

${this.getSystemCapabilities()}

WHEN TO USE TOOLS:
- Use 'create_action' ONLY when user wants to ADD, UPDATE, or REMOVE ingredients
- Use 'get_dashboard_for_date' ONLY when user asks for specific date data
- For general questions about nutrition, calories, or advice - RESPOND DIRECTLY without tools

CRITICAL: Do NOT use tools for general conversation or questions. Only use tools for specific actions.
`;

        const prompt = `${systemPrompt}\n\nChat History:\n${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}\n\nAssistant Response:`;

        const tools = [{
            functionDeclarations: [
                {
                    name: "create_action",
                    description: "Proposes an action to modify the dashboard (add, update, or remove ingredients).",
                    parameters: {
                        type: Type.OBJECT,
                        properties: {
                            type: {
                                type: Type.STRING,
                                enum: ["add_ingredient", "update_ingredient", "remove_ingredient"],
                                description: "The type of action to perform."
                            },
                            data: {
                                type: Type.OBJECT,
                                description: "The data for the action.",
                                properties: {
                                    mealType: {
                                        type: Type.STRING,
                                        enum: ["breakfast", "lunch", "dinner", "snacks"],
                                        description: "The meal to modify. Must be lowercase."
                                    },
                                    ingredientId: {
                                        type: Type.STRING,
                                        description: "The ID of the ingredient (required for update/remove)."
                                    },
                                    name: {
                                        type: Type.STRING,
                                        description: "The name of the ingredient."
                                    },
                                    ingredient: {
                                        type: Type.OBJECT,
                                        description: "For ADD only!, the ingredient data",
                                        properties: {
                                            name: { type: Type.STRING },
                                            quantity: { type: Type.STRING },
                                            calories: { type: Type.NUMBER },
                                            protein: { type: Type.NUMBER },
                                            carbs: { type: Type.NUMBER },
                                            fats: { type: Type.NUMBER },
                                            fiber: { type: Type.NUMBER }
                                        },
                                        required: ["name", "quantity", "calories", "protein", "carbs", "fats", "fiber"]
                                    },
                                    updates: {
                                        type: Type.OBJECT,
                                        description: "For UPDATE only!, the data that will be updated",
                                        properties: {
                                            quantity: { type: Type.STRING, description: "Quantity in string format e.g. '100g'" },
                                            calories: { type: Type.NUMBER },
                                            protein: { type: Type.NUMBER },
                                            carbs: { type: Type.NUMBER },
                                            fats: { type: Type.NUMBER },
                                            fiber: { type: Type.NUMBER }
                                        },
                                        required: ["quantity", "calories", "protein", "carbs", "fats", "fiber"]
                                    }
                                },
                                required: ["mealType", "name"]
                            }
                        },
                        required: ["type", "data"]
                    }
                },
                {
                    name: "get_dashboard_for_date",
                    description: "Fetches the nutritional data and ingredients for a specific date.",
                    parameters: {
                        type: Type.OBJECT,
                        properties: {
                            date: { type: Type.STRING, description: "The date to fetch (yyyy-mm-dd)." }
                        },
                        required: ["date"]
                    }
                }
            ]
        }];

        try {
            const contents = [
                {
                    role: 'model',
                    parts: [{ text: systemPrompt }]
                },
                ...messages.map(m => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.content }]
                }))
            ];

            // Manual loop for tool calls
            let result;
            let candidate;

            while (true) {
                const currentModel = await this.getModelVersion();
                result = await (this.ai as any).models.generateContent({
                    model: currentModel,
                    contents: contents,
                    config: {
                        tools: tools
                    }
                });

                candidate = result.response?.candidates?.[0] || result.candidates?.[0];
                if (!candidate) throw new Error("No response from Gemini");

                const functionCalls = candidate.content?.parts?.filter((p: any) => p.functionCall);
                const getDashboardCall = functionCalls?.find((p: any) => p.functionCall.name === 'get_dashboard_for_date');

                if (getDashboardCall) {
                    const date = getDashboardCall.functionCall.args.date;
                    let dataResult = "{}";
                    if (this.dashboardRepo) {
                        try {
                            const dashboardData = await this.dashboardRepo.getDashboardForDate(date);
                            dataResult = JSON.stringify(dashboardData);
                        } catch (e) {
                            dataResult = "Error fetching data for this date.";
                        }
                    } else {
                        dataResult = "Repository not available on server.";
                    }

                    // Append the model's tool call and the user's tool response to history
                    contents.push(candidate.content);
                    contents.push({
                        role: 'user',
                        parts: [{
                            functionResponse: {
                                name: "get_dashboard_for_date",
                                response: { content: dataResult }
                            }
                        }]
                    } as any);

                    // Continue loop to get final text
                    continue;
                }

                // If no more get_dashboard calls, we are done (or it's a create_action)
                break;
            }

            let content = "";
            let functionCallPart = null;

            if (candidate?.content?.parts) {
                for (const part of candidate.content.parts) {
                    if (part.text) {
                        content += part.text;
                    }
                    if (part.functionCall && part.functionCall.name === 'create_action') {
                        functionCallPart = part.functionCall;
                    }
                }
            }

            const preparedActionMessages: Record<string, string> = {
                'pt': "✅ Preparei a ação para você.",
                'es': "✅ He preparado la acción para ti.",
                'en': "✅ I have prepared the action for you."
            };
            const defaultPreparedMessage = preparedActionMessages[context.language] || preparedActionMessages['en'];

            const assistantMessage: ChatMessage = {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: functionCallPart ? (content || defaultPreparedMessage) : (content || "I didn't have anything to say."),
                timestamp: new Date(),
            };

            if (functionCallPart && functionCallPart.name === "create_action") {
                assistantMessage.pendingAction = this.createPendingAction(functionCallPart.args as any, context);
            }

            return assistantMessage;

        } catch (error) {
            const translations = { en, pt, es };
            const language = context?.language || 'en';
            const locale = translations[language as keyof typeof translations] || en;
            const errorId = `gemini-err-${Date.now()}`;

            // Categorize and log detailed error information
            let errorType = 'UNKNOWN_GEMINI_ERROR';
            let userMessage = locale.assistant.errors.unknown_error;

            if (error instanceof Error) {
                const errorMessage = error.message.toLowerCase();


                if (errorMessage.includes('api key') || errorMessage.includes('unauthorized')) {
                    errorType = 'GEMINI_API_KEY_ERROR';
                    userMessage = locale.assistant.errors.api_key;
                } else if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
                    errorType = 'GEMINI_QUOTA_ERROR';
                    userMessage = locale.assistant.errors.quota_exceeded;
                } else if (errorMessage.includes('model') || errorMessage.includes('not found')) {
                    errorType = 'GEMINI_MODEL_ERROR';
                    userMessage = locale.assistant.errors.model_error;
                } else if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
                    errorType = 'GEMINI_NETWORK_ERROR';
                    userMessage = locale.assistant.errors.network_error;
                } else if (errorMessage.includes('safety') || errorMessage.includes('content')) {
                    errorType = 'GEMINI_SAFETY_ERROR';
                    userMessage = locale.assistant.errors.safety_error;
                } else if (errorMessage.includes('invalid') || errorMessage.includes('parse')) {
                    errorType = 'GEMINI_INVALID_REQUEST';
                    userMessage = locale.assistant.errors.invalid_request;
                }
            }

            console.error(`[${errorId}] Gemini Chat Error Details:`, {
                errorType,
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                model: await this.getModelVersion().catch(() => 'unknown'),
                requestContext: {
                    messageCount: messages?.length || 0,
                    hasContext: !!context,
                    language: context?.language || 'en'
                }
            });

            return {
                id: errorId,
                role: 'assistant',
                content: userMessage,
                timestamp: new Date()
            };
        }
    }
}
