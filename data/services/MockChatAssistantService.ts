import { ChatAssistantService, ChatAssistantContextData } from '../../domain/services/ChatAssistantService';
import { ChatMessage, PendingAction } from '../../domain/entities/ChatMessage';

export class MockChatAssistantService implements ChatAssistantService {
    private mockResponses: Record<string, string> = {
        'calorias': 'Baseado nos seus dados de hoje, você consumiu **250 kcal** até agora.\n\n**Meta diária**: 2000 kcal\n**Restante**: 1750 kcal',
        'proteina': 'Seus objetivos de proteína:\n\n- **Meta**: 150g\n- **Consumido**: 45g\n- **Restante**: 105g',
        'adicionar': 'Para adicionar um ingrediente, preciso de algumas informações:\n\n1. Qual refeição? (café da manhã, almoço, jantar, lanches)\n2. Nome do ingrediente\n3. Quantidade',
        'calories': 'Based on your data today, you consumed **250 kcal** so far.\n\n**Daily Goal**: 2000 kcal\n**Remaining**: 1750 kcal',
        'protein': 'Your protein goals:\n\n- **Goal**: 150g\n- **Consumed**: 45g\n- **Remaining**: 105g',
        'add': 'To add an ingredient, I need some info:\n\n1. Which meal?\n2. Ingredient name\n3. Quantity',
    };

    async sendMessage(messages: ChatMessage[], context: ChatAssistantContextData): Promise<ChatMessage> {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const userMessage = messages[messages.length - 1].content;
        const lowerMessage = userMessage.toLowerCase();

        // Check for adding ingredient pattern
        if (lowerMessage.includes('adicione') || lowerMessage.includes('adicionar') || lowerMessage.includes('add')) {
            // Simulate pending action for confirmation
            const pendingAction: PendingAction = {
                id: `action-${Date.now()}`,
                type: 'add_ingredient',
                data: {
                    date: (() => {
                        const d = new Date();
                        const year = d.getFullYear();
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                    })(),
                    mealType: 'lunch',
                    ingredient: {
                        name: 'Rice (Arroz)',
                        quantity: '100g',
                        calories: 130,
                        protein: 2.7,
                        carbs: 28,
                        fats: 0.3,
                        fiber: 0.4,
                    },
                },
                description: 'Add 100g of Rice to Lunch',
            };

            return {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: 'Got it! You want to add **100g of Rice** to your **Lunch**.\n\n**Nutritional Info:**\n- Calories: 130 kcal\n- Protein: 2.7g\n- Carbs: 28g\n- Fats: 0.3g\n- Fiber: 0.4g\n\nDo you want to confirm this addition?',
                timestamp: new Date(),
                pendingAction,
            };
        }

        // Check for update ingredient pattern
        if (lowerMessage.includes('atualiz') || lowerMessage.includes('modific') || lowerMessage.includes('update')) {
            const pendingAction: PendingAction = {
                id: `action-${Date.now()}`,
                type: 'update_ingredient',
                data: {
                    date: (() => {
                        const d = new Date();
                        const year = d.getFullYear();
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                    })(),
                    ingredientId: 'mock-id-123',
                    mealType: 'breakfast',
                    updates: {
                        quantity: '150g',
                        calories: 195,
                    },
                },
                description: 'Update quantity to 150g',
            };

            return {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: 'I will update the ingredient quantity to **150g**.\n\nConfirm update?',
                timestamp: new Date(),
                pendingAction,
            };
        }

        // Check for remove ingredient pattern
        if (lowerMessage.includes('remov') || lowerMessage.includes('delet') || lowerMessage.includes('tir') || lowerMessage.includes('delete')) {
            const pendingAction: PendingAction = {
                id: `action-${Date.now()}`,
                type: 'remove_ingredient',
                data: {
                    date: (() => {
                        const d = new Date();
                        const year = d.getFullYear();
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                    })(),
                    ingredientId: 'mock-id-123',
                    mealType: 'snacks',
                },
                description: 'Remove ingredient from Snacks',
            };

            return {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: 'I understood that you want to remove an ingredient from your **Snacks**.\n\nConfirm removal?',
                timestamp: new Date(),
                pendingAction,
            };
        }

        // Default responses based on keywords
        let response = 'Hello! I am **HealthPal Assistant**. How can I help you today?\n\nI can help with:\n- 📊 Calorie and macro info\n- 🍽️ Add, update, or remove ingredients\n- 💡 Nutritional tips';

        for (const [keyword, mockResponse] of Object.entries(this.mockResponses)) {
            if (lowerMessage.includes(keyword)) {
                response = mockResponse;
                break;
            }
        }

        return {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: response,
            timestamp: new Date(),
        };
    }
}
