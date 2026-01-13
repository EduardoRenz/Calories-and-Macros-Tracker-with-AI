import { ChatAssistantService, ChatAssistantContextData } from '../../domain/services/ChatAssistantService';
import { ChatMessage } from '../../domain/entities/ChatMessage';
import { Ingredient } from '../../domain/entities/dashboard';

export abstract class BaseChatAssistantService implements ChatAssistantService {
    abstract sendMessage(messages: ChatMessage[], context: ChatAssistantContextData): Promise<ChatMessage>;

    protected buildSystemPrompt(context: ChatAssistantContextData): string {
        const today = new Date().toISOString().split('T')[0];

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

        return `You are HealthPal AI, a smart nutrition assistant.
Your goal is to help users track their calories and macros, manage their meals, and answer nutritional questions.

Context:
Date: ${today}
Language: ${context.language || 'en'}
${profileContext}
${dashboardContext}

Capabilities:
1. Answer questions about nutrition, diet, and health.
2. Propose actions to MODIFY the dashboard: Add, Update, or Remove ingredients.
3. When proposing an action, you MUST provide the specific details in the 'action' field of the JSON response.
4. For 'add_ingredient', you MUST estimate/calculate the nutritional info (calories, macros) for the specified quantity (default to 100g if unspecified but clear in context).
5. For 'remove_ingredient' or 'update_ingredient', use the Exising Ingredient IDs provided in the Context. If ambiguous, ask for clarification.
6. ALWAYS respond in the user's preferred language (specified in Context as Language).

CRITICAL INSTRUCTIONS:
- You CANNOT directly modify the database. You can ONLY propose actions.
- NEVER say "I have added/updated/removed...".
- ALWAYS say "I have prepared a proposal to add..." or "Please confirm the addition of...".
- If you do not generate an 'action' in the JSON, do NOT imply you did something.
- If you don't know the calories/macros for a food, say so and do not propose an action.

Output Format:
You must respond with a JSON object adhering to this schema:
{
  "content": "Your friendly, helpful response text here (markdown supported).",
  "action": {
    "type": "add_ingredient" | "update_ingredient" | "remove_ingredient" | "none", // use 'none' if no action needed
    "data": { // Only required if type != 'none'
       "mealType"?: "breakfast" | "lunch" | "dinner" | "snacks",
       "ingredient"?: { // Required for 'add_ingredient' and 'update_ingredient' (for updates, only include changed fields merged with originals)
          "name": "string",
          "quantity": "string or number", // e.g. "100"
          "calories": number,
          "protein": number,
          "carbs": number,
          "fats": number,
          "fiber": number
       },
       "ingredientId"?: "string" // Required for 'remove_ingredient' and 'update_ingredient'
    }
  }
}
`;
    }
}
