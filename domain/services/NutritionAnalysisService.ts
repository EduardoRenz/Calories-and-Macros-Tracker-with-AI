import type { Ingredient } from '../entities/dashboard';
import { FOOD_CATEGORIES_LIST, getFoodCategoriesPromptText } from '../constants/foodCategories';

export type NutritionalInfo = Omit<Ingredient, 'id' | 'name' | 'quantity'> & { quantityInGrams?: number };

export abstract class NutritionAnalysisService {
  abstract getNutritionalInfo(ingredientName: string, quantity: string, language: string): Promise<NutritionalInfo | null>;

  /**
   * Builds the prompt for nutrition analysis, including food categories.
   */
  protected buildNutritionPrompt(ingredientName: string, quantity: string, language: string): string {
    const languageMap: { [key: string]: string } = {
      'en': 'English',
      'es': 'Spanish',
      'pt': 'Portuguese'
    };
    const languageName = languageMap[language] || 'English';

    const categoriesPrompt = getFoodCategoriesPromptText();
    const categoriesList = FOOD_CATEGORIES_LIST.join('", "');

    return `Provide the estimated nutritional information (calories, protein, carbs, fats, fiber) and a category for the following food item: "${quantity} of ${ingredientName}".
        IMPORTANT: Estimate based on a typical plate size or serving if specific units are ambiguous.
        Also provide the estimated quantity in grams for the given amount.
        ${categoriesPrompt}

        Respond ONLY with a valid JSON object (no markdown, no code blocks) matching this schema:
        {
            "calories": number, // kcal
            "protein": number, // grams
            "carbs": number, // grams
            "fats": number, // grams
            "fiber": number, // grams
            "quantityInGrams": number, // grams
            "category": "string" // one of: "${categoriesList}"
        }

        If you cannot determine the info, return 0 for all values.
        Respond in English regardless of the input language, but understand the food name in ${languageName}.`;
  }
}
