import { ChatAssistantService, ChatAssistantContextData } from "../../domain/services/ChatAssistantService"
import {
  ChatMessage,
  PendingAction,
  ActionDataType,
  AddIngredientActionData,
  UpdateIngredientActionData,
  RemoveIngredientActionData,
} from "../../domain/entities/ChatMessage"
import { Ingredient } from "../../domain/entities/dashboard"

type ActionArgs = {
  add_ingredient: { type: "add_ingredient"; data: Partial<AddIngredientActionData> }
  update_ingredient: { type: "update_ingredient"; data: Partial<UpdateIngredientActionData> }
  remove_ingredient: { type: "remove_ingredient"; data: Partial<RemoveIngredientActionData> }
}

export abstract class BaseChatAssistantService implements ChatAssistantService {
  abstract sendMessage(messages: ChatMessage[], context: ChatAssistantContextData): Promise<ChatMessage>

  protected buildContextString(context: ChatAssistantContextData): string {
    const today = context.currentDate || new Date().toISOString().split("T")[0]
    const timezone = context.timezone || "UTC"

    // Format dashboard data for context
    let dashboardContext = "No dashboard data available."
    if (context.dashboardData) {
      dashboardContext = "Current Dashboard:\n"

      // Add macros summary with goals and remaining
      const macros = context.dashboardData.macros
      dashboardContext += "Daily Macros Progress:\n"
      dashboardContext += `- Calories: ${macros.calories.current.toFixed(1)}${macros.calories.goal ? `/${macros.calories.goal}kcal (${(macros.calories.goal - macros.calories.current).toFixed(1)}kcal remaining)` : "kcal (no goal set)"}\n`
      dashboardContext += `- Protein: ${macros.protein.current.toFixed(1)}${macros.protein.goal ? `/${macros.protein.goal}g (${(macros.protein.goal - macros.protein.current).toFixed(1)}g remaining)` : "g (no goal set)"}\n`
      dashboardContext += `- Carbs: ${macros.carbs.current.toFixed(1)}${macros.carbs.goal ? `/${macros.carbs.goal}g (${(macros.carbs.goal - macros.carbs.current).toFixed(1)}g remaining)` : "g (no goal set)"}\n`
      dashboardContext += `- Fats: ${macros.fats.current.toFixed(1)}${macros.fats.goal ? `/${macros.fats.goal}g (${(macros.fats.goal - macros.fats.current).toFixed(1)}g remaining)` : "g (no goal set)"}\n\n`

      // Add meals details
      Object.entries(context.dashboardData.meals).forEach(([key, meal]) => {
        const m = meal as any // Cast for simplicity
        dashboardContext += `- ${m.name} (${key}): ${m.calories}kcal. Ingredients: \n`
        m.ingredients.forEach((ing: Ingredient) => {
          dashboardContext += `  * [ID: ${ing.id}] ${ing.name} (${ing.quantity}g, ${ing.calories}kcal)\n`
        })
      })
    }

    const profileContext = context.userProfile
      ? `
User Profile:
Name: ${context.userProfile.name}
Goal: ${context.userProfile.fitnessGoals.primaryGoal}
Diet: ${context.userProfile.dietType || "Not specified"}
`
      : "No profile data."

    return `Context:
Date: ${today}
Timezone: ${timezone}
Language: ${context.language || "en"}
${profileContext}
${dashboardContext}`
  }

  protected getSystemCapabilities(): string {
    return `Capabilities:
1. Answer questions about nutrition, diet, and health.
2. Answer questions about daily macros progress, including current consumption, goals, and remaining amounts for calories, protein, carbs, and fats.
Capability 3: Propose actions to MODIFY the dashboard (Add, Update, Remove).
Capability 4: FETCH historical dashboard data for specific dates using 'get_dashboard_for_date'.
5. For 'add_ingredient', you MUST infer the 'mealType' if not stated (based on time or default to 'snacks').
6. For 'add_ingredient', you MUST estimate/calculate the nutritional info (calories, protein, carbs, fats). THESE FIELDS ARE MANDATORY. Do not leave them as zero or null if you can estimate them. USE AVERAGE VALUES. Do not refuse to add because you are unsure, just estimate.
7. UNIT CONVERSION: ALWAYS convert user quantities to GRAMS. Examples: "1 copo" → "200g", "1 ovo" → "50g", "1 fatia" → "30g", "1 colher" → "15g", "1 xícara" → "240g", "1 prato" → "250g". Use standard conversion values.
8. For 'remove_ingredient', you MUST provide both 'ingredientId' AND 'name' fields. Use the Exising Ingredient IDs provided in the Context. If ambiguous, ask for clarification.
9. For 'update_ingredient', you MUST provide both 'ingredientId' AND 'updates' fields. Use the Exising Ingredient IDs provided in the Context. If ambiguous, ask for clarification.
10. ALWAYS respond in the user's preferred language (specified in Context as Language).

CRITICAL INSTRUCTIONS:
- OBJECTIVE AND DIRECT: Answer directly what the user wants in the shortest way possible.
- ALWAYS say "I have prepared a proposal to add..." or "Please confirm the addition of...".
- The user MUST confirm via the UI Card you generate.
- If you infer 'mealType', mention it briefly in your content response.
`
  }

  protected getPersonaHeader(): string {
    return `You are Lumi, a purely functional and objective nutrition assistant. 
Your goal is to help users track data and answer questions with absolute brevity and no conversational filler.`
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
       "name": "string", // Required for remove_ingredient or update
       "ingredientId"?: "string", // Required for update/remove
       "ingredient"?: { // Only when adding a new ingredient
          "name": "string",
          "quantity": "string", // e.g. "100g" — NO FIELD SUFFIXES like "_g", "_grams", "_kcal"
          "calories": number, // Numeric only, NO "_g" or "_kcal" suffix
          "protein": number, // Numeric quantity in grams
          "carbs": number, // Numeric quantity in grams
          "fats": number, // Numeric quantity in grams
          "fiber": number // Numeric quantity in grams
       },
       "updates"?: { // only for update a food
          "quantity"?: "string", // e.g. "100g" — NO field suffixes
          "calories"?: number, // Numeric quantity in grams
          "protein"?: number, // Numeric quantity in grams
          "carbs"?: number, // Numeric quantity in grams
          "fats"?: number, // Numeric quantity in grams
          "fiber"?: number //Numeric quantity in grams
       }
    }
  }
}

STRICT FIELD NAME RULES:
- NEVER use "_g", "_kcal", "_grams", "_gram", "_gal" suffixes in field names
- Always use: name, quantity, calories, protein, carbs, fats, fiber (exact names)
- quantity is a STRING with unit (e.g. "100g"), not a number
- All nutritional values are NUMBERS without units
- fiber defaults to 0 if not provided

IMPORTANT: For remove_ingredient, both "name" and "ingredientId" are REQUIRED.
For update_ingredient, both "ingredientId" and "updates" are REQUIRED.
For add_ingredient, "ingredient" is REQUIRED.`
  }

  protected buildSystemPrompt(context: ChatAssistantContextData): string {
    return `${this.getPersonaHeader()}

${this.buildContextString(context)}

${this.getSystemCapabilities()}

${this.getOutputInstructions()}
`
  }

  protected createPendingAction<T extends ActionDataType>(args: ActionArgs[T], context: ChatAssistantContextData): PendingAction {
    const actionType = args.type
    const actionData = args.data as any
    let formattedData: any = { ...actionData }

    // Normalize all possible field name variations to standard format
    const normalizeFieldName = (obj: any): any => {
      if (!obj || typeof obj !== "object") return obj
      const normalized: any = {}

      for (const [key, value] of Object.entries(obj)) {
        // Remove all known suffixes: _g, _grams, _gram, _gal, _kcal
        const cleanKey = key
          .replace(/_g$/, "") // _g suffix
          .replace(/_grams?$/, "") // _gram or _grams
          .replace(/_gal$/, "") // _gal
          .replace(/_kcal$/, "") // _kcal

        if (!normalized[cleanKey]) {
          normalized[cleanKey] = value
        }
      }
      return normalized
    }

    // Normalize ingredient/updates structure
    const normalizeNutritionData = (
      raw: any,
    ):
      | {
          name?: string
          quantity?: string
          calories?: number
          protein?: number
          carbs?: number
          fats?: number
          fiber?: number
        }
      | undefined => {
      if (!raw || typeof raw !== "object") return undefined

      const normalized = normalizeFieldName(raw)

      return {
        ...(normalized.name && { name: normalized.name }),
        ...(normalized.quantity && { quantity: String(normalized.quantity) }),
        ...(normalized.calories != null && { calories: Number(normalized.calories) }),
        ...(normalized.protein != null && { protein: Number(normalized.protein) }),
        ...(normalized.carbs != null && { carbs: Number(normalized.carbs) }),
        ...(normalized.fats != null && { fats: Number(normalized.fats) }),
        ...(normalized.fiber != null && { fiber: Number(normalized.fiber) }),
      }
    }

    const findIngredientName = (ingredientId?: string): string | undefined => {
      if (!ingredientId || !context.dashboardData) return undefined
      for (const meal of Object.values(context.dashboardData.meals)) {
        const found = meal.ingredients.find((ing: Ingredient) => ing.id === ingredientId)
        if (found) return found.name
      }
      return undefined
    }

    // Ensure date
    formattedData.date = context.currentDate || new Date().toISOString().split("T")[0]

    // Process each action type
    if (actionType === "add_ingredient") {
      const addIngredientData = actionData as AddIngredientActionData & any

      // Normalize mealType
      if (!formattedData.mealType) {
        console.warn("AI missing mealType, defaulting to 'snacks'")
        formattedData.mealType = "snacks"
      }

      // Try to find and normalize ingredient data
      let ingredient = normalizeNutritionData(formattedData.ingredient)

      // If ingredient not found in .ingredient, try .updates or root
      if (!ingredient) {
        ingredient = normalizeNutritionData(actionData.updates)
      }
      if (!ingredient) {
        ingredient = normalizeNutritionData(actionData)
      }

      // Ensure fiber has default value
      if (ingredient) {
        ingredient.fiber = ingredient.fiber ?? 0
        formattedData.ingredient = ingredient
        delete formattedData.updates // Clean up if it was moved from updates
      }
    } else if (actionType === "update_ingredient") {
      // Normalize mealType fallback
      if (!formattedData.mealType) {
        formattedData.mealType = actionData.meal_type || actionData.meal || "snacks"
      }

      // Normalize updates
      let updates = normalizeNutritionData(formattedData.updates)
      if (!updates) {
        updates = normalizeNutritionData(actionData)
      }

      if (updates && Object.keys(updates).length > 0) {
        formattedData.updates = updates
      }

      if (!formattedData.name && formattedData.ingredientId) {
        const ingredientName = findIngredientName(formattedData.ingredientId)
        if (ingredientName) {
          formattedData.name = ingredientName
        }
      }
    }

    // Build description
    let description = ""
    switch (actionType) {
      case "add_ingredient": {
        const ing = formattedData.ingredient
        const itemName = ing?.name || formattedData.name || "item"
        const itemQuantity = ing?.quantity || formattedData.quantity || "an item"
        description = `Add ${itemQuantity} ${itemName} to ${formattedData.mealType}`
        break
      }
      case "update_ingredient": {
        const updateName = formattedData.updates?.name || formattedData.name || "item"
        description = `Update ${updateName} in ${formattedData.mealType}`
        break
      }
      case "remove_ingredient": {
        description = `Remove ${formattedData.name} from ${formattedData.mealType}`
        break
      }
    }

    return {
      id: `action-${Date.now()}`,
      type: actionType,
      data: formattedData,
      description: description,
    }
  }
}
