import type { Ingredient } from '../entities/dashboard';
import { FOOD_CATEGORIES_LIST, getFoodCategoriesPromptText } from '../constants/foodCategories';

/**
 * Defines the contract for a service that can analyze an image of a meal
 * and return a list of its ingredients with nutritional information.
 */
export abstract class ImageRecognitionService {
  /**
   * Analyzes a meal image.
   * @param image The image file (Blob) to analyze.
   * @param language The target language for the ingredient names (e.g., 'en', 'es').
   * @param prompt Optional additional context to help with the analysis.
   * @returns A promise that resolves to an array of identified ingredients.
   */
  abstract analyzeMealImage(image: Blob, language: string, prompt?: string): Promise<Omit<Ingredient, 'id'>[]>;

  /**
   * Builds the default prompt for image analysis, including food categories.
   */
  protected buildDefaultPrompt(language: string): string {
    const categoriesPrompt = getFoodCategoriesPromptText();
    const categoriesList = FOOD_CATEGORIES_LIST.join('", "');
    const langName = language === 'pt' ? 'Portuguese' : (language === 'es' ? 'Spanish' : 'English');

    return `Analyze the food items in this image.
        Provide a list of ingredients with their estimated quantity strictly in grams (e.g., "150g"),
        nutritional information (calories, protein, carbs, fats, fiber) per serving, and a category for each food item.
        ${categoriesPrompt}
        Name the ingredients in ${langName}.

        Respond ONLY with a valid JSON object matching this schema:
        {
            "ingredients": [
                {
                    "name": "string",
                    "quantity": "string", // e.g. "150g"
                    "calories": number,
                    "protein": number,
                    "carbs": number,
                    "fats": number,
                    "fiber": number,
                    "category": "string" // one of: "${categoriesList}"
                }
            ]
        }

        If an item is unrecognizable, omit it.`;
  }
}
