import { GoogleGenAI, Type } from "@google/genai";
import { ChatAssistantContextData } from '../../domain/services/ChatAssistantService';
import { BaseChatAssistantService } from './BaseChatAssistantService';
import { ChatMessage, PendingAction } from '../../domain/entities/ChatMessage';
import { DashboardRepository } from '../../domain/repositories/DashboardRepository';

export class GeminiChatAssistantService extends BaseChatAssistantService {
    private ai: GoogleGenAI;
    private model: string = process.env.GEMINI_FAST_DEFAULT_MODEL || 'gemini-2.5-flash-lite';

    constructor(apiKey?: string, private dashboardRepo?: DashboardRepository) {
        super();
        const key = apiKey || process.env.GEMINI_API_KEY;
        if (!key) {
            console.error("Gemini API key not found. Chat Assistant will fail.");
        }
        this.ai = new GoogleGenAI({ apiKey: key || 'dummy' });
    }

    async sendMessage(messages: ChatMessage[], context: ChatAssistantContextData): Promise<ChatMessage> {
        // Construct the prompt manually using Base parts, BUT skipping getOutputInstructions (JSON)
        // because we want to use Tools.

        let systemPrompt = `${this.getPersonaHeader()}

${this.buildContextString(context)}

${this.getSystemCapabilities()}

IMPORTANT: To propose an action (add/update/remove ingredient), YOU MUST USE THE 'create_action' TOOL provided. Do not output JSON text for actions in your response content. Just use the tool.
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
                                    ingredient: {
                                        type: Type.OBJECT,
                                        description: "The ingredient details (required for add/update).",
                                        properties: {
                                            name: { type: Type.STRING },
                                            quantity: { type: Type.STRING, description: "Quantity in string format e.g. '100g'" },
                                            calories: { type: Type.NUMBER },
                                            protein: { type: Type.NUMBER },
                                            carbs: { type: Type.NUMBER },
                                            fats: { type: Type.NUMBER },
                                            fiber: { type: Type.NUMBER }
                                        },
                                        required: ["name", "quantity", "calories", "protein", "carbs", "fats"]
                                    }
                                },
                                required: ["mealType"]
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
                    role: 'user',
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
                result = await (this.ai as any).models.generateContent({
                    model: this.model,
                    contents: contents,
                    tools: tools as any
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

            const assistantMessage: ChatMessage = {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: content || (functionCallPart ? "I have prepared the action for you." : "I didn't have anything to say."),
                timestamp: new Date(),
            };

            if (functionCallPart && functionCallPart.name === "create_action") {
                assistantMessage.pendingAction = this.createPendingAction(functionCallPart.args as any);
            }

            return assistantMessage;

        } catch (error) {
            console.error("Gemini Chat Error:", error);
            return {
                id: `err-${Date.now()}`,
                role: 'assistant',
                content: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.",
                timestamp: new Date()
            };
        }
    }

    private createPendingAction(args: { type: string, data: any }): PendingAction {
        const actionType = args.type as any;
        const actionData = args.data;
        let formattedData: any = { ...actionData };

        // Ensure date is set inferred
        formattedData.date = (() => {
            const d = new Date();
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        })();

        // Basic Validation / Fallback
        if (actionType === 'add_ingredient') {
            if (!actionData.mealType) {
                console.warn("AI didn't specify mealType in Tool Call, defaulting to 'snacks'");
                formattedData.mealType = 'snacks';
            }
        }

        let description = '';
        switch (actionType) {
            case 'add_ingredient':
                description = `Add ${actionData.ingredient?.quantity || ''} ${actionData.ingredient?.name} to ${formattedData.mealType || actionData.mealType}`;
                break;
            case 'update_ingredient':
                description = `Update ingredient in ${formattedData.mealType || actionData.mealType}`;
                break;
            case 'remove_ingredient':
                description = `Remove ingredient from ${formattedData.mealType || actionData.mealType}`;
                break;
        }

        return {
            id: `action-${Date.now()}`,
            type: actionType,
            data: formattedData,
            description: description
        };
    }
}
