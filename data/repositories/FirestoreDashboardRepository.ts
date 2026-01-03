import { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import { DashboardData, Ingredient, MealSummary } from '../../domain/entities/dashboard';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDb } from '../firebase';
import { getAuth } from '../auth';
import { CalorieCalculationService } from '../../domain/services/CalorieCalculationService';
import { FirestoreProfileRepository } from './FirestoreProfileRepository';
import { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';

// Helper function to create an empty dashboard structure for a new day
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

// Helper function to recalculate all meal and macro totals from the ingredients list
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

export class FirestoreDashboardRepository implements DashboardRepository {
    private auth = getAuth();
    private profileRepository: ProfileRepository = new FirestoreProfileRepository();
    private concurrencyManager = new ConcurrencyRequestManager();

    private getDocRef(date: string) {
        const user = this.auth.currentUser;
        if (!user) {
            throw new Error("No authenticated user found for dashboard operations.");
        }
        return doc(getDb(), 'users', user.uid, 'dashboard_data', date);
    }

    async getDashboardForDate(date: string): Promise<DashboardData> {
        const key = `getDashboardForDate:${date}`;
        return this.concurrencyManager.run(key, async () => {
            const docRef = this.getDocRef(date);
            const docSnap = await getDoc(docRef);

            const profile = await this.profileRepository.getProfile();
            const goals = CalorieCalculationService.calculateGoals(profile);

            if (!docSnap.exists()) {
                const newDashboard = createEmptyDashboard(date, goals);
                await setDoc(docRef, newDashboard);
                return newDashboard;
            }

            const data = docSnap.data() as DashboardData;
            let needsUpdate = false;

            // Ensure `macros` object and its properties exist and goals are up-to-date.
            if (!data.macros) {
                data.macros = createEmptyDashboard(date, goals).macros;
                needsUpdate = true;
            } else {
                if (data.macros.calories.goal !== goals.calories) { data.macros.calories.goal = goals.calories; needsUpdate = true; }
                if (data.macros.protein.goal !== goals.protein) { data.macros.protein.goal = goals.protein; needsUpdate = true; }
                if (data.macros.carbs.goal !== goals.carbs) { data.macros.carbs.goal = goals.carbs; needsUpdate = true; }
                if (data.macros.fats.goal !== goals.fats) { data.macros.fats.goal = goals.fats; needsUpdate = true; }
            }

            // Ensure `meals` object exists.
            if (!data.meals) {
                data.meals = createEmptyDashboard(date, goals).meals;
                needsUpdate = true;
            }

            // Ensure every ingredient has `fiber` (backward compatibility).
            for (const mealType in data.meals) {
                const meal = data.meals[mealType as keyof MealSummary];
                if (!meal.ingredients) continue;
                for (const ing of meal.ingredients) {
                    if (typeof (ing as any).fiber !== 'number') {
                        (ing as any).fiber = 0;
                        needsUpdate = true;
                    }
                }
                // Ensure meal has fiber field (backward compatibility)
                if (typeof (meal as any).fiber !== 'number') {
                    (meal as any).fiber = meal.ingredients.reduce((total: number, ing: any) => total + (ing.fiber || 0), 0);
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                // Asynchronously update the document in Firestore to correct it for next time.
                setDoc(docRef, data, { merge: true });
            }

            return data;
        });
    }

    async addIngredient(date: string, mealType: keyof MealSummary, ingredient: Omit<Ingredient, 'id'>): Promise<DashboardData> {
        return this.addIngredients(date, mealType, [ingredient]);
    }

    async addIngredients(date: string, mealType: keyof MealSummary, ingredients: Omit<Ingredient, 'id'>[]): Promise<DashboardData> {
        const dataForDay = await this.getDashboardForDate(date);

        const newIngredients: Ingredient[] = ingredients.map(ing => ({
            ...ing,
            fiber: typeof (ing as any).fiber === 'number' ? (ing as any).fiber : 0,
            id: `${new Date().getTime()}-${Math.random()}`,
        }));

        dataForDay.meals[mealType].ingredients.push(...newIngredients);
        const updatedData = recalculateTotals(dataForDay);

        await setDoc(this.getDocRef(date), updatedData);
        return updatedData;
    }

    async removeIngredient(date: string, mealType: keyof MealSummary, ingredientId: string): Promise<DashboardData> {
        const dataForDay = await this.getDashboardForDate(date);

        const meal = dataForDay.meals[mealType];
        meal.ingredients = meal.ingredients.filter(ing => ing.id !== ingredientId);

        const updatedData = recalculateTotals(dataForDay);
        await setDoc(this.getDocRef(date), updatedData);

        return updatedData;
    }
}