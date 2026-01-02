import { ImageRecognitionService } from '../../domain/services/ImageRecognitionService';
import { Ingredient } from '../../domain/entities/dashboard';

export class MockImageRecognitionService implements ImageRecognitionService {
    async analyzeMealImage(image: Blob, language: string): Promise<Omit<Ingredient, 'id'>[]> {
        console.log(`[MockImageRecognitionService] Analyzing image of ${image.size} bytes in ${language}`);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (language === 'pt') {
            return [
                { name: 'Arroz Branco', quantity: '100g', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4 },
                { name: 'Peito de Frango', quantity: '150g', calories: 247, protein: 46.5, carbs: 0, fats: 5.4, fiber: 0 },
                { name: 'Salada de Alface', quantity: '50g', calories: 7, protein: 0.6, carbs: 1.5, fats: 0.1, fiber: 0.7 }
            ];
        }

        if (language === 'es') {
            return [
                { name: 'Arroz Blanco', quantity: '100g', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4 },
                { name: 'Pechuga de Pollo', quantity: '150g', calories: 247, protein: 46.5, carbs: 0, fats: 5.4, fiber: 0 },
                { name: 'Ensalada de Lechuga', quantity: '50g', calories: 7, protein: 0.6, carbs: 1.5, fats: 0.1, fiber: 0.7 }
            ];
        }

        return [
            { name: 'White Rice', quantity: '100g', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4 },
            { name: 'Chicken Breast', quantity: '150g', calories: 247, protein: 46.5, carbs: 0, fats: 5.4, fiber: 0 },
            { name: 'Lettuce Salad', quantity: '50g', calories: 7, protein: 0.6, carbs: 1.5, fats: 0.1, fiber: 0.7 }
        ];
    }
}
