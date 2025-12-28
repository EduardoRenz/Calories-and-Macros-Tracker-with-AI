import type { Ingredient } from '../entities/dashboard';

export type NutritionalInfo = Omit<Ingredient, 'id' | 'name' | 'quantity'> & { quantityInGrams?: number };

export interface NutritionAnalysisService {
  getNutritionalInfo(ingredientName: string, quantity: string, language: string): Promise<NutritionalInfo | null>;
}
