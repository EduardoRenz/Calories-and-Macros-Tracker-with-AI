import { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import { DashboardData, Ingredient, MealSummary } from '../../domain/entities/dashboard';
import { LocalProfileRepository } from './LocalProfileRepository';
import { CalorieCalculationService } from '../../domain/services/CalorieCalculationService';

const getTodayString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const createEmptyDashboard = (date: string, goals: { calories: number; protein: number; carbs: number; fats: number; }): DashboardData => ({
  date,
  macros: {
    calories: { current: 0, goal: goals.calories },
    protein: { current: 0, goal: goals.protein },
    carbs: { current: 0, goal: goals.carbs },
    fats: { current: 0, goal: goals.fats },
  },
  meals: {
    breakfast: { name: "Breakfast", calories: 0, protein: 0, carbs: 0, fats: 0, ingredients: [] },
    lunch: { name: "Lunch", calories: 0, protein: 0, carbs: 0, fats: 0, ingredients: [] },
    dinner: { name: "Dinner", calories: 0, protein: 0, carbs: 0, fats: 0, ingredients: [] },
    snacks: { name: "Snacks", calories: 0, protein: 0, carbs: 0, fats: 0, ingredients: [] },
  },
});

const recalculateTotals = (data: DashboardData): DashboardData => {
  const newData = JSON.parse(JSON.stringify(data));
  
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;

  for (const mealType in newData.meals) {
      const meal = newData.meals[mealType as keyof MealSummary];
      meal.calories = Math.round(meal.ingredients.reduce((sum, ing: Ingredient) => sum + ing.calories, 0));
      meal.protein = Math.round(meal.ingredients.reduce((sum, ing: Ingredient) => sum + ing.protein, 0));
      meal.carbs = Math.round(meal.ingredients.reduce((sum, ing: Ingredient) => sum + ing.carbs, 0));
      meal.fats = Math.round(meal.ingredients.reduce((sum, ing: Ingredient) => sum + ing.fats, 0));
      
      totalCalories += meal.calories;
      totalProtein += meal.protein;
      totalCarbs += meal.carbs;
      totalFats += meal.fats;
  }

  newData.macros.calories.current = Math.round(totalCalories);
  newData.macros.protein.current = Math.round(totalProtein);
  newData.macros.carbs.current = Math.round(totalCarbs);
  newData.macros.fats.current = Math.round(totalFats);

  return newData;
};

// Simulate a local data store
const dailyDataStore = new Map<string, DashboardData>();

export class LocalDashboardRepository implements DashboardRepository {
    private profileRepository = new LocalProfileRepository();

    async getDashboardForDate(date: string): Promise<DashboardData> {
        await new Promise(resolve => setTimeout(resolve, 300));
        if (!dailyDataStore.has(date)) {
            const profile = await this.profileRepository.getProfile();
            const goals = CalorieCalculationService.calculateGoals(profile);
            dailyDataStore.set(date, createEmptyDashboard(date, goals));
        }
        return JSON.parse(JSON.stringify(dailyDataStore.get(date)!));
    }

    async addIngredient(date: string, mealType: keyof MealSummary, ingredient: Omit<Ingredient, 'id'>): Promise<DashboardData> {
        return this.addIngredients(date, mealType, [ingredient]);
    }

    async addIngredients(date: string, mealType: keyof MealSummary, ingredients: Omit<Ingredient, 'id'>[]): Promise<DashboardData> {
        await new Promise(resolve => setTimeout(resolve, 300));

        let dataForDay = dailyDataStore.get(date);
        
        if (!dataForDay) {
            // This case handles adding food to a day that hasn't been viewed yet.
            const profile = await this.profileRepository.getProfile();
            const goals = CalorieCalculationService.calculateGoals(profile);
            dataForDay = createEmptyDashboard(date, goals);
        }
        
        const newIngredients: Ingredient[] = ingredients.map(ing => ({
            ...ing,
            id: `${new Date().getTime()}-${Math.random()}`, // Ensure unique ID
        }));

        dataForDay.meals[mealType].ingredients.push(...newIngredients);
        const updatedData = recalculateTotals(dataForDay);

        dailyDataStore.set(date, updatedData);
        return JSON.parse(JSON.stringify(updatedData));
    }


    async removeIngredient(date: string, mealType: keyof MealSummary, ingredientId: string): Promise<DashboardData> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const dataForDay = dailyDataStore.get(date);
        if (!dataForDay) {
            // Should not happen if getDashboardForDate was called, but as a safeguard:
            return this.getDashboardForDate(date);
        }

        const meal = dataForDay.meals[mealType];
        meal.ingredients = meal.ingredients.filter(ing => ing.id !== ingredientId);
        
        const updatedData = recalculateTotals(dataForDay);
        dailyDataStore.set(date, updatedData);
        
        return JSON.parse(JSON.stringify(updatedData));
    }
}