import { ChatAssistantService, ChatAssistantContextData } from '../../domain/services/ChatAssistantService';
import { ChatMessage, PendingAction } from '../../domain/entities/ChatMessage';

export class MockChatAssistantService implements ChatAssistantService {
    private mockResponses: Record<string, Record<string, string>> = {
        'pt': {
            'calorias': 'Baseado nos seus dados de hoje, você consumiu **250 kcal** até agora.\n\n**Meta diária**: 2000 kcal\n**Restante**: 1750 kcal',
            'proteina': 'Seus objetivos de proteína:\n\n- **Meta**: 150g\n- **Consumido**: 45g\n- **Restante**: 105g',
            'adicionar': 'Para adicionar um ingrediente, preciso de algumas informações:\n\n1. Qual refeição? (café da manhã, almoço, jantar, lanches)\n2. Nome do ingrediente\n3. Quantidade',
        },
        'en': {
            'calories': 'Based on your data today, you consumed **250 kcal** so far.\n\n**Daily Goal**: 2000 kcal\n**Remaining**: 1750 kcal',
            'protein': 'Your protein goals:\n\n- **Goal**: 150g\n- **Consumed**: 45g\n- **Remaining**: 105g',
            'add': 'To add an ingredient, I need some info:\n\n1. Which meal?\n2. Ingredient name\n3. Quantity',
        },
        'es': {
            'calorías': 'Basado en tus datos de hoy, has consumido **250 kcal** hasta ahora.\n\n**Meta diaria**: 2000 kcal\n**Restante**: 1750 kcal',
            'proteína': 'Tus objetivos de proteínas:\n\n- **Meta**: 150g\n- **Consumido**: 45g\n- **Restante**: 105g',
            'añadir': 'Para añadir un ingrediente, necesito algo de información:\n\n1. ¿Qué comida? (desayuno, almuerzo, cena, snacks)\n2. Nombre del ingrediente\n3. Cantidad',
        }
    };

    async sendMessage(messages: ChatMessage[], context: ChatAssistantContextData): Promise<ChatMessage> {
        await new Promise(resolve => setTimeout(resolve, 800));

        const userMessage = messages[messages.length - 1].content;
        const lowerMessage = userMessage.toLowerCase();
        const lang = (context.language || 'en').substring(0, 2) as 'pt' | 'en' | 'es';

        // Check for adding ingredient pattern
        if (lowerMessage.includes('adicione') || lowerMessage.includes('adicionar') || lowerMessage.includes('add') || lowerMessage.includes('añadir')) {
            const descriptions = {
                'pt': 'Adicionar 100g de Arroz ao Almoço',
                'en': 'Add 100g of Rice to Lunch',
                'es': 'Añadir 100g de Arroz al Almuerzo'
            };
            const contents = {
                'pt': '✅ Entendi! Você quer adicionar **100g de Arroz** ao seu **Almoço**.\n\n**Informação Nutricional:**\n- Calorias: 130 kcal\n- Proteína: 2.7g\n- Carboidratos: 28g\n- Gorduras: 0.3g\n- Fibras: 0.4g\n\nDeseja confirmar?',
                'en': '✅ Got it! You want to add **100g of Rice** to your **Lunch**.\n\n**Nutritional Info:**\n- Calories: 130 kcal\n- Protein: 2.7g\n- Carbs: 28g\n- Fats: 0.3g\n- Fiber: 0.4g\n\nDo you want to confirm?',
                'es': '✅ ¡Entendido! Quieres añadir **100g de Arroz** a tu **Almuerzo**.\n\n**Información Nutricional:**\n- Calorías: 130 kcal\n- Proteína: 2.7g\n- Carbohidratos: 28g\n- Grasas: 0.3g\n- Fibra: 0.4g\n\n¿Quieres confirmar?'
            };

            const pendingAction: PendingAction = {
                id: `action-${Date.now()}`,
                type: 'add_ingredient',
                data: {
                    date: context.currentDate || new Date().toISOString().split('T')[0],
                    mealType: 'lunch',
                    ingredient: {
                        name: lang === 'pt' ? 'Arroz' : (lang === 'es' ? 'Arroz' : 'Rice'),
                        quantity: '100g',
                        calories: 130,
                        protein: 2.7,
                        carbs: 28,
                        fats: 0.3,
                        fiber: 0.4,
                    },
                },
                description: descriptions[lang] || descriptions['en'],
            };

            return {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: contents[lang] || contents['en'],
                timestamp: new Date(),
                pendingAction,
            };
        }

        // Check for update ingredient pattern
        if (lowerMessage.includes('atualiz') || lowerMessage.includes('modific') || lowerMessage.includes('update') || lowerMessage.includes('actualiz')) {
            const descriptions = { 'pt': 'Atualizar para 150g', 'en': 'Update to 150g', 'es': 'Actualizar a 150g' };
            const contents = {
                'pt': '✅ Vou atualizar a quantidade para **150g**.\n\nConfirmar?',
                'en': '✅ I will update the quantity to **150g**.\n\nConfirm update?',
                'es': '✅ Actualizaré la cantidad a **150g**.\n\n¿Confirmar?'
            };

            return {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: contents[lang] || contents['en'],
                timestamp: new Date(),
                pendingAction: {
                    id: `action-${Date.now()}`,
                    type: 'update_ingredient',
                    data: {
                        date: context.currentDate || new Date().toISOString().split('T')[0],
                        ingredientId: 'mock-id-123',
                        mealType: 'breakfast',
                        updates: { quantity: '150g', calories: 195 },
                    },
                    description: descriptions[lang] || descriptions['en'],
                },
            };
        }

        // Check for remove ingredient pattern
        if (lowerMessage.includes('remov') || lowerMessage.includes('delet') || lowerMessage.includes('tir') || lowerMessage.includes('delete') || lowerMessage.includes('elimin')) {
            const descriptions = { 'pt': 'Remover do Lanches', 'en': 'Remove from Snacks', 'es': 'Eliminar de Snacks' };
            const contents = {
                'pt': '✅ Entendi que você quer remover um item de **Lanches**.\n\nConfirmar remoção?',
                'en': '✅ I understood that you want to remove an item from **Snacks**.\n\nConfirm removal?',
                'es': '✅ Entiendo que quieres eliminar un punto de **Snacks**.\n\n¿Confirmar?'
            };

            return {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: contents[lang] || contents['en'],
                timestamp: new Date(),
                pendingAction: {
                    id: `action-${Date.now()}`,
                    type: 'remove_ingredient',
                    data: {
                        date: context.currentDate || new Date().toISOString().split('T')[0],
                        ingredientId: 'mock-id-123',
                        mealType: 'snacks',
                        name: 'item',
                    },
                    description: descriptions[lang] || descriptions['en'],
                },
            };
        }

        const defaultResponses = {
            'pt': 'Olá! Eu sou o assistente **HealthPal**. Como posso ajudar?\n\nPosso ajudar com:\n- 📊 Calorias e macros\n- 🍽️ Adicionar ou remover itens\n- 💡 Dicas de nutrição',
            'en': 'Hello! I am **HealthPal Assistant**. How can I help today?\n\nI can help with:\n- 📊 Calorie and macro info\n- 🍽️ Add or remove items\n- 💡 Nutritional tips',
            'es': '¡Hola! Soy el asistente **HealthPal**. ¿Cómo puedo ayudar?\n\nPuedo ayudar con:\n- 📊 Info de calorías y macros\n- 🍽️ Añadir o eliminar puntos\n- 💡 Consejos de nutrición'
        };

        let response = defaultResponses[lang] || defaultResponses['en'];
        const currentMock = this.mockResponses[lang] || this.mockResponses['en'];

        for (const [keyword, mockResponse] of Object.entries(currentMock)) {
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
