import { ChatAssistantContextData } from '../../domain/services/ChatAssistantService';
import { BaseChatAssistantService } from './BaseChatAssistantService';
import { ChatMessage, PendingAction } from '../../domain/entities/ChatMessage';

export class OpenAIChatAssistantService extends BaseChatAssistantService {
    protected apiKey: string;
    protected baseUrl: string;
    protected model: string;

    constructor(apiKey: string, baseUrl: string = 'https://api.openai.com/v1', model: string = 'gpt-4o') {
        super();
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.model = model;
    }

    async sendMessage(messages: ChatMessage[], context: ChatAssistantContextData): Promise<ChatMessage> {
        // Build System Prompt
        let systemContent = `${this.getPersonaHeader()}

${this.buildContextString(context)}

${this.getSystemCapabilities()}

IMPORTANT: To propose an action (add/update/remove ingredient), YOU MUST USE THE 'create_action' TOOL provided. Do not output JSON text.
`;

        const apiMessages = [
            { role: 'system', content: systemContent },
            ...messages.map(m => ({ role: m.role, content: m.content }))
        ];

        const tools = [{
            type: "function",
            function: {
                name: "create_action",
                description: "Proposes an action to modify the dashboard.",
                parameters: {
                    type: "object",
                    properties: {
                        type: {
                            type: "string",
                            enum: ["add_ingredient", "update_ingredient", "remove_ingredient"],
                            description: "The type of action to perform."
                        },
                        data: {
                            type: "object",
                            description: "The data for the action.",
                            properties: {
                                mealType: {
                                    type: "string",
                                    enum: ["breakfast", "lunch", "dinner", "snacks"],
                                    description: "The meal to modify. Must be lowercase."
                                },
                                ingredientId: {
                                    type: "string",
                                    description: "The ID of the ingredient (required for update/remove)."
                                },
                                ingredient: {
                                    type: "object",
                                    description: "The ingredient details (required for add/update).",
                                    properties: {
                                        name: { type: "string" },
                                        quantity: { type: "string", description: "Quantity in string format e.g. '100g'" },
                                        calories: { type: "number" },
                                        protein: { type: "number" },
                                        carbs: { type: "number" },
                                        fats: { type: "number" },
                                        fiber: { type: "number" }
                                    },
                                    required: ["name", "quantity", "calories", "protein", "carbs", "fats"]
                                }
                            },
                            required: ["mealType"]
                        }
                    },
                    required: ["type", "data"]
                }
            }
        }];

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: apiMessages,
                    tools: tools,
                    tool_choice: "auto"
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`OpenAI API Error: ${response.status} - ${errText}`);
            }

            const data = await response.json();
            const choice = data.choices[0];
            const message = choice.message;

            const assistantMessage: ChatMessage = {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: message.content || "I have prepared an action.",
                timestamp: new Date()
            };

            if (message.tool_calls && message.tool_calls.length > 0) {
                const toolCall = message.tool_calls[0];
                if (toolCall.function.name === 'create_action') {
                    const args = JSON.parse(toolCall.function.arguments);
                    assistantMessage.pendingAction = this.createPendingAction(args);
                }
            }

            return assistantMessage;
        } catch (error) {
            console.error("OpenAI/DeepSeek Chat Error:", error);
            return {
                id: `err-${Date.now()}`,
                role: 'assistant',
                content: "I'm sorry, I'm having trouble providing a response right now.",
                timestamp: new Date()
            };
        }
    }

    private createPendingAction(args: { type: string, data: any }): PendingAction {
        const actionType = args.type as any;
        const actionData = args.data;
        let formattedData: any = { ...actionData };

        // Ensure date
        formattedData.date = new Date().toISOString().split('T')[0];

        // Validation Fallback
        if (actionType === 'add_ingredient' && !actionData.mealType) {
            console.warn("AI missing mealType, defaulting to 'snacks'");
            formattedData.mealType = 'snacks';
        }

        let description = '';
        switch (actionType) {
            case 'add_ingredient':
                description = `Add ${actionData.ingredient?.quantity || ''} ${actionData.ingredient?.name} to ${formattedData.mealType}`;
                break;
            case 'update_ingredient':
                description = `Update ingredient in ${formattedData.mealType}`;
                break;
            case 'remove_ingredient':
                description = `Remove ingredient from ${formattedData.mealType}`;
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
