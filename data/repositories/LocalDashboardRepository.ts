import { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import { DashboardData, Ingredient, MealSummary } from '../../domain/entities/dashboard';
import { LocalProfileRepository } from './LocalProfileRepository';
import { CalorieCalculationService } from '../../domain/services/CalorieCalculationService';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';


const createEmptyDashboard = (date: string, goals: { calories: number; protein: number; carbs: number; fats: number; }): DashboardData => ({
    date,
    macros: {
        calories: { current: 0, goal: goals.calories },
        protein: { current: 0, goal: goals.protein },
        carbs: { current: 0, goal: goals.carbs },
        fats: { current: 0, goal: goals.fats },
    },
    meals: {
        breakfast: { name: "Breakfast", calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, ingredients: [] },
        lunch: { name: "Lunch", calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, ingredients: [] },
        dinner: { name: "Dinner", calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, ingredients: [] },
        snacks: { name: "Snacks", calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, ingredients: [] },
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
        meal.calories = Math.round(meal.ingredients.reduce((sum: number, ing: Ingredient) => sum + ing.calories, 0));
        meal.protein = Math.round(meal.ingredients.reduce((sum: number, ing: Ingredient) => sum + ing.protein, 0));
        meal.carbs = Math.round(meal.ingredients.reduce((sum: number, ing: Ingredient) => sum + ing.carbs, 0));
        meal.fats = Math.round(meal.ingredients.reduce((sum: number, ing: Ingredient) => sum + ing.fats, 0));
        meal.fiber = Math.round(meal.ingredients.reduce((sum: number, ing: Ingredient) => sum + ing.fiber, 0));

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


const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const createIngredient = (id: string, name: string, calories: number, protein: number, carbs: number, fats: number, fiber: number): Ingredient => ({
    id,
    name,
    quantity: '1',
    calories,
    protein,
    carbs,
    fats,
    fiber,
});



export class LocalDashboardRepository implements DashboardRepository {
    private profileRepository = new LocalProfileRepository();
    // Simulate a local data store
    private dailyDataStore = new Map<string, DashboardData>();
    private isSeeded = false;
    private concurrencyManager = new ConcurrencyRequestManager();

    constructor() {
        this.seedMockDashboards(this.profileRepository);
    }

    private seedMockDashboards = async (profileRepository: LocalProfileRepository) => {
        if (this.isSeeded) return;

        const profile = await profileRepository.getProfile();
        const goals = CalorieCalculationService.calculateGoals(profile);

        const today = new Date();
        const date = (daysAgo: number) => {
            const d = new Date(today);
            d.setDate(d.getDate() - daysAgo);
            return formatDate(d);
        };

        // Yesterday .. 7 days ago
        const d1 = date(1);
        const d2 = date(2);
        const d3 = date(3);
        const d4 = date(4);
        const d5 = date(5);
        const d6 = date(6);
        const d7 = date(7);

        // Day 1: Over calories, all meals
        {
            const data = createEmptyDashboard(d1, goals);
            data.meals.breakfast.ingredients = [createIngredient('seed-d1-b1', 'Oats', 450, 18, 70, 10, 10)];
            data.meals.lunch.ingredients = [createIngredient('seed-d1-l1', 'Chicken Bowl', 900, 60, 80, 25, 25)];
            data.meals.dinner.ingredients = [createIngredient('seed-d1-d1', 'Pizza', 1100, 45, 120, 45, 45)];
            data.meals.snacks.ingredients = [createIngredient('seed-d1-s1', 'Protein Bar', 250, 20, 25, 8, 8)];
            this.dailyDataStore.set(d1, recalculateTotals(data));
        }

        // Day 2: Under calories, multiple meals
        {
            const data = createEmptyDashboard(d2, goals);
            data.meals.breakfast.ingredients = [createIngredient('seed-d2-b1', 'Eggs', 220, 18, 2, 15, 15)];
            data.meals.lunch.ingredients = [createIngredient('seed-d2-l1', 'Salad', 380, 25, 20, 18, 18)];
            data.meals.snacks.ingredients = [createIngredient('seed-d2-s1', 'Yogurt', 140, 12, 18, 2, 2)];
            this.dailyDataStore.set(d2, recalculateTotals(data));
        }

        // Day 3: No entry (empty day) -> simulate no records
        {
            const data = createEmptyDashboard(d3, goals);
            this.dailyDataStore.set(d3, recalculateTotals(data));
        }

        // Day 4: Partial meals (only breakfast)
        {
            const data = createEmptyDashboard(d4, goals);
            data.meals.breakfast.ingredients = [
                createIngredient('seed-d4-b1', 'Toast', 200, 6, 35, 3, 3),
                createIngredient('seed-d4-b2', 'Peanut Butter', 190, 7, 7, 16, 16),
            ];
            this.dailyDataStore.set(d4, recalculateTotals(data));
        }

        // Day 5: Full day, under calories
        {
            const data = createEmptyDashboard(d5, goals);
            data.meals.breakfast.ingredients = [createIngredient('seed-d5-b1', 'Smoothie', 320, 25, 35, 8, 8)];
            data.meals.lunch.ingredients = [createIngredient('seed-d5-l1', 'Turkey Sandwich', 520, 35, 55, 14, 14)];
            data.meals.dinner.ingredients = [createIngredient('seed-d5-d1', 'Fish & Rice', 650, 45, 70, 15, 15)];
            data.meals.snacks.ingredients = [createIngredient('seed-d5-s1', 'Fruit', 120, 1, 30, 0, 0)];
            this.dailyDataStore.set(d5, recalculateTotals(data));
        }

        // Day 6: Over calories, only dinner heavy
        {
            const data = createEmptyDashboard(d6, goals);
            data.meals.dinner.ingredients = [
                createIngredient('seed-d6-d1', 'Burger  ', 850, 40, 60, 45, 45),
                createIngredient('seed-d6-d2', 'Fries', 600, 8, 75, 30, 30),
            ];
            this.dailyDataStore.set(d6, recalculateTotals(data));
        }

        // Day 7: Under calories, lunch + dinner
        {
            const data = createEmptyDashboard(d7, goals);
            data.meals.lunch.ingredients = [createIngredient('seed-d7-l1', 'Rice & Beans', 550, 22, 95, 8, 8)];
            data.meals.dinner.ingredients = [createIngredient('seed-d7-d1', 'Omelette', 380, 28, 5, 26, 26)];
            this.dailyDataStore.set(d7, recalculateTotals(data));
        }

        this.isSeeded = true;
    };

    async getDashboardForDate(date: string): Promise<DashboardData> {
        const key = `getDashboardForDate:${date}`;
        return this.concurrencyManager.run(key, async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
            await this.seedMockDashboards(this.profileRepository);

            if (!this.dailyDataStore.has(date)) {
                const profile = await this.profileRepository.getProfile();
                const goals = CalorieCalculationService.calculateGoals(profile);
                this.dailyDataStore.set(date, createEmptyDashboard(date, goals));
            }
            return JSON.parse(JSON.stringify(this.dailyDataStore.get(date)!));
        });
    }

    async addIngredient(date: string, mealType: keyof MealSummary, ingredient: Omit<Ingredient, 'id'>): Promise<DashboardData> {
        return this.addIngredients(date, mealType, [ingredient]);
    }

    async addIngredients(date: string, mealType: keyof MealSummary, ingredients: Omit<Ingredient, 'id'>[]): Promise<DashboardData> {
        await new Promise(resolve => setTimeout(resolve, 300));

        // Ensure seed data is loaded before modifying any data
        await this.seedMockDashboards(this.profileRepository);

        let dataForDay = this.dailyDataStore.get(date);

        if (!dataForDay) {
            // This case handles adding food to a day that hasn't been viewed yet.
            const profile = await this.profileRepository.getProfile();
            const goals = CalorieCalculationService.calculateGoals(profile);
            dataForDay = createEmptyDashboard(date, goals);
        }

        const newIngredients: Ingredient[] = ingredients.map(ing => ({
            ...ing,
            fiber: typeof (ing as any).fiber === 'number' ? (ing as any).fiber : 0,
            id: `${new Date().getTime()}-${Math.random()}`, // Ensure unique ID
        }));

        dataForDay.meals[mealType].ingredients.push(...newIngredients);
        const updatedData = recalculateTotals(dataForDay);

        this.dailyDataStore.set(date, updatedData);
        return JSON.parse(JSON.stringify(updatedData));
    }


    async removeIngredient(date: string, mealType: keyof MealSummary, ingredientId: string): Promise<DashboardData> {
        await new Promise(resolve => setTimeout(resolve, 300));

        // Ensure seed data is loaded before modifying any data
        await this.seedMockDashboards(this.profileRepository);

        const dataForDay = this.dailyDataStore.get(date);
        if (!dataForDay) {
            // Should not happen if getDashboardForDate was called, but as a safeguard:
            return this.getDashboardForDate(date);
        }

        const meal = dataForDay.meals[mealType];
        meal.ingredients = meal.ingredients.filter(ing => ing.id !== ingredientId);

        const updatedData = recalculateTotals(dataForDay);
        this.dailyDataStore.set(date, updatedData);

        return JSON.parse(JSON.stringify(updatedData));
    }
}