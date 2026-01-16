import { ChatAssistantService, ChatAssistantContextData } from '../../domain/services/ChatAssistantService';
import { ChatMessage, PendingAction, ActionDataType, ActionData, AddIngredientActionData, UpdateIngredientActionData, RemoveIngredientActionData } from '../../domain/entities/ChatMessage';
import { Ingredient } from '../../domain/entities/dashboard';

type ActionArgs = {
    add_ingredient: { type: 'add_ingredient', data: Partial<AddIngredientActionData> };
    update_ingredient: { type: 'update_ingredient', data: Partial<UpdateIngredientActionData> };
    remove_ingredient: { type: 'remove_ingredient', data: Partial<RemoveIngredientActionData> };
};

export abstract class BaseChatAssistantService implements ChatAssistantService {
    abstract sendMessage(messages: ChatMessage[], context: ChatAssistantContextData): Promise<ChatMessage>;

    protected buildContextString(context: ChatAssistantContextData): string {
        const today = context.currentDate || new Date().toISOString().split('T')[0];
        const timezone = context.timezone || 'UTC';

        // Format dashboard data for context
        let dashboardContext = "No dashboard data available.";
        if (context.dashboardData) {
            dashboardContext = "Current Dashboard:\n";
            Object.entries(context.dashboardData.meals).forEach(([key, meal]) => {
                const m = meal as any; // Cast for simplicity
                dashboardContext += `- ${m.name} (${key}): ${m.calories}kcal. Ingredients: \n`;
                m.ingredients.forEach((ing: Ingredient) => {
                    dashboardContext += `  * [ID: ${ing.id}] ${ing.name} (${ing.quantity}g, ${ing.calories}kcal)\n`;
                });
            });
        }

        const profileContext = context.userProfile ? `
User Profile:
Name: ${context.userProfile.name}
Goal: ${context.userProfile.fitnessGoals.primaryGoal}
Diet: ${context.userProfile.dietType || 'Not specified'}
` : "No profile data.";

        return `Context:
Date: ${today}
Timezone: ${timezone}
Language: ${context.language || 'en'}
${profileContext}
${dashboardContext}`;
    }

    protected getSystemCapabilities(): string {
        return `Capabilities:
1. Answer questions about nutrition, diet, and health.
Capability 2: Propose actions to MODIFY the dashboard (Add, Update, Remove).
Capability 3: FETCH historical dashboard data for specific dates using 'get_dashboard_for_date'.
4. For 'add_ingredient', you MUST infer the 'mealType' if not stated (based on time or default to 'snacks').
5. For 'add_ingredient', you MUST estimate/calculate the nutritional info (calories, protein, carbs, fats). THESE FIELDS ARE MANDATORY. Do not leave them as zero or null if you can estimate them. USE AVERAGE VALUES. Do not refuse to add because you are unsure, just estimate.
6. UNIT CONVERSION: ALWAYS convert user quantities to GRAMS. Examples: "1 copo" → "200g", "1 ovo" → "50g", "1 fatia" → "30g", "1 colher" → "15g", "1 xícara" → "240g", "1 prato" → "250g". Use standard conversion values.
7. For 'remove_ingredient', you MUST provide both 'ingredientId' AND 'name' fields. Use the Exising Ingredient IDs provided in the Context. If ambiguous, ask for clarification.
8. For 'update_ingredient', you MUST provide both 'ingredientId' AND 'updates' fields. Use the Exising Ingredient IDs provided in the Context. If ambiguous, ask for clarification.
9. ALWAYS respond in the user's preferred language (specified in Context as Language).

CRITICAL INSTRUCTIONS:
- OBJECTIVE AND DIRECT: Answer directly what the user wants in the shortest way possible.
- ALWAYS say "I have prepared a proposal to add..." or "Please confirm the addition of...".
- The user MUST confirm via the UI Card you generate.
- If you infer 'mealType', mention it briefly in your content response.
`;
    }

    protected getPersonaHeader(): string {
        return `You are HealthPal AI, a purely functional and objective nutrition assistant. 
Your goal is to help users track data and answer questions with absolute brevity and no conversational filler.`;
    }

    protected getOutputInstructions(): string {
        return `Output Format:
You must respond with a JSON object adhering to this schema:
{
  "content": "Your friendly, helpful response text here (markdown supported).",
  "action": {
    "type": "add_ingredient" | "update_ingredient" | "remove_ingredient" | "none",
    "data": {
       "mealType"?: "breakfast" | "lunch" | "dinner" | "snacks", // MUST be lowercase
       "name"?: "string", // Required for remove_ingredient
       "ingredientId"?: "string", // Required for update/remove
       "ingredient"?: {
          "name": "string",
          "quantity": "string", // e.g. "100g"
          "calories": number,
          "protein": number,
          "carbs": number,
          "fats": number,
          "fiber": number
       },
       "updates"?: {
          "name"?: "string",
          "quantity"?: "string",
          "calories"?: number,
          "protein"?: number,
          "carbs"?: number,
          "fats"?: number,
          "fiber"?: number
       }
    }
  }
}

IMPORTANT: For remove_ingredient, both "name" and "ingredientId" are REQUIRED.
For update_ingredient, both "ingredientId" and "updates" are REQUIRED.
For add_ingredient, "ingredient" is REQUIRED.`;
    }

    protected buildSystemPrompt(context: ChatAssistantContextData): string {
        return `${this.getPersonaHeader()}

${this.buildContextString(context)}

${this.getSystemCapabilities()}

${this.getOutputInstructions()}
`;
    }

    protected createPendingAction<T extends ActionDataType>(args: ActionArgs[T], context: ChatAssistantContextData): PendingAction {
        const actionType = args.type;
        const actionData = args.data as any;
        let formattedData: any = { ...actionData };

        // Ensure date
        formattedData.date = context.currentDate || new Date().toISOString().split('T')[0];

        // Validation Fallback
        if (actionType === 'add_ingredient') {
            const addIngredientData = actionData as AddIngredientActionData;
            if (!addIngredientData.mealType) {
                console.warn("AI missing mealType, defaulting to 'snacks'");
                formattedData.mealType = 'snacks';
            }

            // Fix data structure for add_ingredient - AI sometimes sends 'updates' instead of 'ingredient'
            if (actionData.updates && !actionData.ingredient) {
                formattedData.ingredient = actionData.updates;
                delete formattedData.updates;
            }
        }

        let description = '';
        switch (actionType) {
            case 'add_ingredient':
                const addActionData = actionData as AddIngredientActionData;
                description = `Add ${addActionData.ingredient?.quantity} ${addActionData.ingredient?.name} to ${formattedData.mealType}`;
                break;
            case 'update_ingredient':
                const updateActionData = actionData as UpdateIngredientActionData;
                description = `Update ${updateActionData.updates?.name} in ${formattedData.mealType}`;
                break;
            case 'remove_ingredient':
                const removeActionData = actionData as RemoveIngredientActionData;
                description = `Remove ${removeActionData.name} from ${formattedData.mealType}`;
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
