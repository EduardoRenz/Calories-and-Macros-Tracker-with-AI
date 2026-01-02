import { FoodAnalysisRepository } from '../../domain/repositories/FoodAnalysisRepository';
import { DashboardData } from '../../domain/entities/dashboard';

/**
 * Local/mock implementation of FoodAnalysisRepository with pre-filled sample data.
 * Used for testing and development.
 */
export class LocalFoodAnalysisRepository implements FoodAnalysisRepository {
    async getDashboardDataForRange(startDate: string, endDate: string): Promise<DashboardData[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Generate mock data for the date range
        const dashboardData: DashboardData[] = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateString = d.toISOString().split('T')[0];
            dashboardData.push(this.generateMockDayData(dateString));
        }

        return dashboardData;
    }

    private generateMockDayData(date: string): DashboardData {
        // Sample foods arrays for variation
        const breakfastFoods = [
            { name: 'Oatmeal', quantity: '1 cup', calories: 150, protein: 5, carbs: 27, fats: 3, fiber: 4 },
            { name: 'Eggs', quantity: '2 units', calories: 180, protein: 12, carbs: 1, fats: 12, fiber: 0 },
            { name: 'Coffee', quantity: '1 cup', calories: 5, protein: 0, carbs: 0, fats: 0, fiber: 0 },
            { name: 'Orange Juice', quantity: '200ml', calories: 90, protein: 1, carbs: 21, fats: 0, fiber: 0 },
            { name: 'Toast', quantity: '2 slices', calories: 140, protein: 4, carbs: 26, fats: 2, fiber: 2 }
        ];

        const lunchFoods = [
            { name: 'Grilled Chicken', quantity: '150g', calories: 250, protein: 47, carbs: 0, fats: 5, fiber: 0 },
            { name: 'Rice', quantity: '1 cup', calories: 200, protein: 4, carbs: 45, fats: 0, fiber: 0 },
            { name: 'Mixed Salad', quantity: '1 bowl', calories: 50, protein: 2, carbs: 10, fats: 1, fiber: 5 },
            { name: 'Beans', quantity: '100g', calories: 120, protein: 8, carbs: 20, fats: 0, fiber: 9 },
            { name: 'Olive Oil', quantity: '1 tbsp', calories: 120, protein: 0, carbs: 0, fats: 14, fiber: 0 }
        ];

        const dinnerFoods = [
            { name: 'Salmon', quantity: '200g', calories: 400, protein: 40, carbs: 0, fats: 24, fiber: 0 },
            { name: 'Broccoli', quantity: '150g', calories: 50, protein: 4, carbs: 10, fats: 0, fiber: 3 },
            { name: 'Sweet Potato', quantity: '1 medium', calories: 100, protein: 2, carbs: 23, fats: 0, fiber: 2 },
            { name: 'Quinoa', quantity: '100g', calories: 120, protein: 4, carbs: 21, fats: 2, fiber: 3 },
            { name: 'Avocado', quantity: '1/2 unit', calories: 160, protein: 2, carbs: 9, fats: 15, fiber: 7 }
        ];

        const snackFoods = [
            { name: 'Almonds', quantity: '30g', calories: 180, protein: 6, carbs: 6, fats: 16, fiber: 3 },
            { name: 'Apple', quantity: '1 unit', calories: 95, protein: 0, carbs: 25, fats: 0, fiber: 4 },
            { name: 'Greek Yogurt', quantity: '150g', calories: 100, protein: 17, carbs: 6, fats: 0, fiber: 0 },
            { name: 'Protein Bar', quantity: '1 unit', calories: 200, protein: 20, carbs: 20, fats: 8, fiber: 2 },
            { name: 'Banana', quantity: '1 unit', calories: 105, protein: 1, carbs: 27, fats: 0, fiber: 3 }
        ];

        // Randomly select some foods for each meal to simulate real usage
        const dayOfWeek = new Date(date).getDay();
        const selectFoods = (foods: typeof breakfastFoods, count: number) => {
            const shuffled = [...foods].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, count).map((f, i) => ({ ...f, id: `${date}-${i}-${Math.random()}` }));
        };

        const breakfast = selectFoods(breakfastFoods, 2 + (dayOfWeek % 2));
        const lunch = selectFoods(lunchFoods, 3);
        const dinner = selectFoods(dinnerFoods, 2 + (dayOfWeek % 3));
        const snacks = selectFoods(snackFoods, dayOfWeek % 3);

        const sumMacros = (ingredients: typeof breakfast) => ({
            calories: ingredients.reduce((sum, i) => sum + i.calories, 0),
            protein: ingredients.reduce((sum, i) => sum + i.protein, 0),
            carbs: ingredients.reduce((sum, i) => sum + i.carbs, 0),
            fats: ingredients.reduce((sum, i) => sum + i.fats, 0),
            fiber: ingredients.reduce((sum, i) => sum + i.fiber, 0)
        });

        const breakfastMacros = sumMacros(breakfast);
        const lunchMacros = sumMacros(lunch);
        const dinnerMacros = sumMacros(dinner);
        const snacksMacros = sumMacros(snacks);

        const totalMacros = {
            calories: breakfastMacros.calories + lunchMacros.calories + dinnerMacros.calories + snacksMacros.calories,
            protein: breakfastMacros.protein + lunchMacros.protein + dinnerMacros.protein + snacksMacros.protein,
            carbs: breakfastMacros.carbs + lunchMacros.carbs + dinnerMacros.carbs + snacksMacros.carbs,
            fats: breakfastMacros.fats + lunchMacros.fats + dinnerMacros.fats + snacksMacros.fats
        };

        return {
            date,
            macros: {
                calories: { current: totalMacros.calories, goal: 2000 },
                protein: { current: totalMacros.protein, goal: 140 },
                carbs: { current: totalMacros.carbs, goal: 250 },
                fats: { current: totalMacros.fats, goal: 65 }
            },
            meals: {
                breakfast: {
                    name: 'Breakfast',
                    ...breakfastMacros,
                    ingredients: breakfast
                },
                lunch: {
                    name: 'Lunch',
                    ...lunchMacros,
                    ingredients: lunch
                },
                dinner: {
                    name: 'Dinner',
                    ...dinnerMacros,
                    ingredients: dinner
                },
                snacks: {
                    name: 'Snacks',
                    ...snacksMacros,
                    ingredients: snacks
                }
            }
        };
    }
}
