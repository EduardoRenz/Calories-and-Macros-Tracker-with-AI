import { ChatAssistantService, ChatAssistantContextData } from '../../domain/services/ChatAssistantService';
import { ChatMessage } from '../../domain/entities/ChatMessage';
import { Ingredient } from '../../domain/entities/dashboard';

export abstract class BaseChatAssistantService implements ChatAssistantService {
    abstract sendMessage(messages: ChatMessage[], context: ChatAssistantContextData): Promise<ChatMessage>;

    protected buildContextString(context: ChatAssistantContextData): string {
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

        return `Context:
Date: ${today}
Language: ${context.language || 'en'}
${profileContext}
${dashboardContext}`;
    }

    protected getSystemCapabilities(): string {
        return `Capabilities:
1. Answer questions about nutrition, diet, and health.
2. Propose actions to MODIFY the dashboard: Add, Update, or Remove ingredients.
3. For 'add_ingredient', you MUST infer the 'mealType' if not stated (based on time or default to 'snacks').
4. For 'add_ingredient', you MUST estimate/calculate the nutritional info (calories, macros) for the specified quantity (default to 100g if unspecified). USE AVERAGE VALUES. Do not refuse to add because you are unsure, just estimate.
5. For 'remove_ingredient' or 'update_ingredient', use the Exising Ingredient IDs provided in the Context. If ambiguous, ask for clarification.
6. ALWAYS respond in the user's preferred language (specified in Context as Language).

CRITICAL INSTRUCTIONS:
- PURELY FUNCTIONAL: You are a data-driven assistant. Do NOT be polite, do NOT use greetings (e.g. "Hello", "Sure"), and do NOT use conversational filler.
- ABSOLUTELY NO CHIT-CHAT: Focus ONLY on the requested data or action.
- OBJECTIVE AND DIRECT: Answer directly what the user wants in the shortest way possible.
- NEVER say "I have added/updated/removed...".
- ALWAYS say "I have prepared a proposal to add..." or "Please confirm the addition of...".
- The user MUST confirm via the UI Card you generate.
- If the user says "Yes", "Confirm", or "Do it" in response to a proposal:
  - Do NOT re-propose the action. Tell them to click the button.
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
       "ingredient"?: {
          "name": "string",
          "quantity": "string", // e.g. "100g"
          "calories": number,
          "protein": number,
          "carbs": number,
          "fats": number,
          "fiber": number
       },
       "ingredientId"?: "string"
    }
  }
}`;
    }

    protected buildSystemPrompt(context: ChatAssistantContextData): string {
        return `${this.getPersonaHeader()}

${this.buildContextString(context)}

${this.getSystemCapabilities()}

${this.getOutputInstructions()}
`;
    }
}
