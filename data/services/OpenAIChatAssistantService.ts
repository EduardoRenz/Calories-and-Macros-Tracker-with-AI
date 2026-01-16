import { ChatAssistantContextData } from '../../domain/services/ChatAssistantService';
import { BaseChatAssistantService } from './BaseChatAssistantService';
import { ChatMessage, PendingAction } from '../../domain/entities/ChatMessage';
import { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import { ModelConfigRepository } from '../../domain/repositories/ModelConfigRepository';
import { RepositoryFactory } from '../RepositoryFactory';

export class OpenAIChatAssistantService extends BaseChatAssistantService {
    protected apiKey: string;
    protected baseUrl: string;
    protected dashboardRepo?: DashboardRepository;
    private modelConfigRepo: ModelConfigRepository;
    protected providerName: string;

    constructor(apiKey: string, dashboardRepo?: DashboardRepository, baseUrl: string = 'https://api.openai.com/v1', providerName: string = 'openai') {
        super();
        this.apiKey = apiKey;
        this.dashboardRepo = dashboardRepo;
        this.baseUrl = baseUrl;
        this.providerName = providerName;
        this.modelConfigRepo = RepositoryFactory.getModelConfigRepository();
    }

    private async getModelVersion(): Promise<string> {
        try {
            return await this.modelConfigRepo.getModelVersion(this.providerName, 'chat')
                || this.getDefaultModel();
        } catch (error) {
            console.warn('Failed to get model version from remote config, using fallback:', error);
            return this.getDefaultModel();
        }
    }

    private getDefaultModel(): string {
        switch (this.providerName) {
            case 'deepseek':
                return 'deepseek-chat';
            case 'openai':
                return 'gpt-4o';
            case 'gemini':
                return 'gemini-2.5-flash-lite';
            default:
                return 'gpt-4o';
        }
    }

    async sendMessage(messages: ChatMessage[], context: ChatAssistantContextData): Promise<ChatMessage> {
        // Build System Prompt
        let systemContent = `${this.getPersonaHeader()}

${this.buildContextString(context)}

${this.getSystemCapabilities()}

IMPORTANT: To propose an action (add/update/remove ingredient), YOU MUST USE THE 'create_action' TOOL provided. Do not output JSON text.
`;

        const apiMessages: any[] = [
            { role: 'system', content: systemContent },
            ...messages.map(m => ({ role: m.role, content: m.content }))
        ];

        const tools = [
            {
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
                                    updates: {
                                        type: "object",
                                        description: "The ingredient details or updates (required for add/update).",
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
            },
            {
                type: "function",
                function: {
                    name: "get_dashboard_for_date",
                    description: "Fetches the nutritional data and ingredients for a specific date.",
                    parameters: {
                        type: "object",
                        properties: {
                            date: { type: "string", description: "The date to fetch (yyyy-mm-dd)." }
                        },
                        required: ["date"]
                    }
                }
            }
        ];

        try {
            let currentMessages = [...apiMessages];

            while (true) {
                const response = await fetch(`${this.baseUrl}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify({
                        model: await this.getModelVersion(),
                        messages: currentMessages,
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

                if (message.tool_calls && message.tool_calls.length > 0) {
                    const toolCall = message.tool_calls[0];
                    if (toolCall.function.name === 'get_dashboard_for_date') {
                        const args = JSON.parse(toolCall.function.arguments);
                        let dataResult = "{}";
                        if (this.dashboardRepo) {
                            try {
                                const dashboardData = await this.dashboardRepo.getDashboardForDate(args.date);
                                dataResult = JSON.stringify(dashboardData);
                            } catch (e) {
                                dataResult = "Error fetching data for this date.";
                            }
                        } else {
                            dataResult = "Repository not available on server.";
                        }

                        currentMessages.push(message);
                        currentMessages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: dataResult
                        });
                        continue;
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
                    content: message.content || defaultPreparedMessage,
                    timestamp: new Date()
                };

                if (message.tool_calls && message.tool_calls.length > 0) {
                    const toolCall = message.tool_calls[0];
                    if (toolCall.function.name === 'create_action') {
                        const args = JSON.parse(toolCall.function.arguments);
                        assistantMessage.pendingAction = this.createPendingAction(args, context);
                    }
                }

                return assistantMessage;
            }
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

    private createPendingAction(args: { type: string, data: any }, context: ChatAssistantContextData): PendingAction {
        const actionType = args.type as any;
        const actionData = args.data;
        let formattedData: any = { ...actionData };

        // Ensure date
        formattedData.date = context.currentDate || new Date().toISOString().split('T')[0];

        // Validation Fallback
        if (actionType === 'add_ingredient' && !actionData.mealType) {
            console.warn("AI missing mealType, defaulting to 'snacks'");
            formattedData.mealType = 'snacks';
        }

        let description = '';
        switch (actionType) {
            case 'add_ingredient':
                description = `Add ${actionData.updates?.quantity || actionData.ingredient?.quantity || ''} ${actionData.updates?.name || actionData.ingredient?.name || ''} to ${formattedData.mealType}`;
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
