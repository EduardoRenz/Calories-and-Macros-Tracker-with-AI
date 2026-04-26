import type { Ingredient } from '../entities/dashboard';

/**
 * Defines the contract for a service that can analyze an image of a meal
 * and return a list of its ingredients with nutritional information.
 */
export interface ImageRecognitionService {
  /**
   * Analyzes a meal image.
   * @param image The image file (Blob) to analyze.
   * @param language The target language for the ingredient names (e.g., 'en', 'es').
   * @param prompt Optional additional context to help with the analysis.
   * @returns A promise that resolves to an array of identified ingredients.
   */
  analyzeMealImage(image: Blob, language: string, prompt?: string): Promise<Omit<Ingredient, 'id'>[]>;
}