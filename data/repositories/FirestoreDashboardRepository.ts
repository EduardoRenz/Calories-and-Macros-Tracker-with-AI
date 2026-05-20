import { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import { DashboardData, Ingredient, MealSummary } from '../../domain/entities/dashboard';
import { doc, getDoc, setDoc, collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { getDb } from '../firebase';
import { getAuth } from '../auth';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';
import { DataCacheManager } from '../infrastructure/DataCacheManager';

// Helper function to create an empty dashboard structure for a new day
const createEmptyDashboard = (date: string, goals?: { calories: number; protein: number; carbs: number; fats: number; }): DashboardData => ({
    date,
    macros: {
        calories: { current: 0, goal: goals?.calories ?? 0 },
        protein: { current: 0, goal: goals?.protein ?? 0 },
        carbs: { current: 0, goal: goals?.carbs ?? 0 },
        fats: { current: 0, goal: goals?.fats ?? 0 },
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
    const newData = JSON.parse(JSON.stringify(data)) as DashboardData;

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
    private static instance: FirestoreDashboardRepository;
    private auth = getAuth();
    private concurrencyManager = new ConcurrencyRequestManager();
    private dataCacheManager = new DataCacheManager();

    private constructor() { }

    public static getInstance(): FirestoreDashboardRepository {
        if (!FirestoreDashboardRepository.instance) {
            FirestoreDashboardRepository.instance = new FirestoreDashboardRepository();
        }
        return FirestoreDashboardRepository.instance;
    }

    private getDocRef(date: string) {
        const user = this.auth.currentUser;
        if (!user) {
            throw new Error("No authenticated user found for dashboard operations.");
        }
        return doc(getDb(), 'users', user.uid, 'dashboard_data', date);
    }

    async getDashboardForDate(date: string): Promise<DashboardData> {
        const key = `getDashboardForDate:${date}`;
        return this.dataCacheManager.getCached(key, async () => {
            return this.concurrencyManager.run(key, async () => {
                const docRef = this.getDocRef(date);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    const newDashboard = createEmptyDashboard(date);
                    await setDoc(docRef, newDashboard);
                    return newDashboard;
                }

                const data = docSnap.data() as DashboardData;
                let needsUpdate = false;

                // Ensure `macros` object and its properties exist.
                if (!data.macros) {
                    data.macros = createEmptyDashboard(date).macros;
                    needsUpdate = true;
                }

                // Ensure `meals` object exists.
                if (!data.meals) {
                    data.meals = createEmptyDashboard(date).meals;
                    needsUpdate = true;
                }

                // Ensure every ingredient has `fiber` (backward compatibility).
                for (const mealType in data.meals) {
                    const meal = data.meals[mealType as keyof MealSummary];
                    if (!meal.ingredients) continue;
                    for (const ing of meal.ingredients) {
                        if (typeof ing.fiber !== 'number') {
                            ing.fiber = 0;
                            needsUpdate = true;
                        }
                    }
                    // Ensure meal has fiber field (backward compatibility)
                    if (typeof meal.fiber !== 'number') {
                        meal.fiber = meal.ingredients.reduce((total: number, ing: Ingredient) => total + (ing.fiber || 0), 0);
                        needsUpdate = true;
                    }
                }

                if (needsUpdate) {
                    // Asynchronously update the document in Firestore to correct it for next time.
                    setDoc(docRef, data, { merge: true });
                }

                return data;
            });
        });
    }

    async getDashboardRange(startDate: string, endDate: string): Promise<DashboardData[]> {
        const key = `getDashboardRange:${startDate}:${endDate}`;
        return this.dataCacheManager.getCached(key, async () => {
            return this.concurrencyManager.run(key, async () => {
                const user = this.auth.currentUser;
                if (!user) {
                    throw new Error("No authenticated user found for dashboard operations.");
                }

                const colRef = collection(getDb(), 'users', user.uid, 'dashboard_data');
                // Note: documentId() is the date string
                const q = query(
                    colRef,
                    where(documentId(), '>=', startDate),
                    where(documentId(), '<=', endDate)
                );

                const snap = await getDocs(q);

                const fetchedDataMap = new Map<string, DashboardData>();

                snap.docs.forEach(d => {
                    fetchedDataMap.set(d.id, d.data() as DashboardData);
                });

                // Build seamless range
                const listDates = (start: string, end: string): string[] => {
                    const result: string[] = [];
                    let current = new Date(start + 'T00:00:00');
                    const last = new Date(end + 'T00:00:00');
                    if (isNaN(current.getTime())) {
                        const [y, m, d] = start.split('-').map(Number);
                        current = new Date(y, m - 1, d);
                    }
                    let lastDate = last;
                    if (isNaN(last.getTime())) {
                        const [y, m, d] = end.split('-').map(Number);
                        lastDate = new Date(y, m - 1, d);
                    }

                    while (current <= lastDate) {
                        const y = current.getFullYear();
                        const m = String(current.getMonth() + 1).padStart(2, '0');
                        const d = String(current.getDate()).padStart(2, '0');
                        result.push(`${y}-${m}-${d}`);
                        current.setDate(current.getDate() + 1);
                    }
                    return result;
                };

                const allDates = listDates(startDate, endDate);
                const result: DashboardData[] = [];

                for (const date of allDates) {
                    if (fetchedDataMap.has(date)) {
                        result.push(fetchedDataMap.get(date)!);
                    } else {
                        result.push(createEmptyDashboard(date));
                    }
                }

                return result;
            });
        });
    }

    async addIngredient(date: string, mealType: keyof MealSummary, ingredient: Omit<Ingredient, 'id'>): Promise<DashboardData> {
        return this.addIngredients(date, mealType, [ingredient]);
    }

    async addIngredients(date: string, mealType: keyof MealSummary, ingredients: Omit<Ingredient, 'id'>[]): Promise<DashboardData> {
        const dataForDay = await this.getDashboardForDate(date);

        const now = new Date().toISOString();
        const newIngredients: Ingredient[] = ingredients.map(ing => ({
            ...ing,
            fiber: typeof ing.fiber === 'number' ? ing.fiber : 0,
            id: `${new Date().getTime()}-${Math.random()}`,
            created_at: now,
            category: ing.category,
        }));

        dataForDay.meals[mealType].ingredients.push(...newIngredients);
        const updatedData = recalculateTotals(dataForDay);

        await setDoc(this.getDocRef(date), updatedData);
        // Invalidate cache
        this.dataCacheManager.invalidate(`getDashboardForDate:${date}`);
        return updatedData;
    }

    async removeIngredient(date: string, mealType: keyof MealSummary, ingredientId: string): Promise<DashboardData> {
        const dataForDay = await this.getDashboardForDate(date);

        const meal = dataForDay.meals[mealType];
        meal.ingredients = meal.ingredients.filter(ing => ing.id !== ingredientId);

        const updatedData = recalculateTotals(dataForDay);
        await setDoc(this.getDocRef(date), updatedData);
        // Invalidate cache
        this.dataCacheManager.invalidate(`getDashboardForDate:${date}`);

        return updatedData;
    }

    async updateIngredient(date: string, mealType: keyof MealSummary, ingredientId: string, updates: Partial<Omit<Ingredient, 'id'>>): Promise<DashboardData> {
        if (!updates || Object.keys(updates).length === 0) {
            console.warn("No updates provided to updateIngredient");
            return this.getDashboardForDate(date);
        }

        const dataForDay = await this.getDashboardForDate(date);

        const meal = dataForDay.meals[mealType];
        const ingredientIndex = meal.ingredients.findIndex(ing => ing.id === ingredientId);

        if (ingredientIndex === -1) {
            throw new Error(`Ingredient ${ingredientId} not found in ${mealType}`);
        }

        // Update the ingredient with the provided updates
        const updatedIngredient = {
            ...meal.ingredients[ingredientIndex],
            ...updates,
        };

        // Ensure calories/macros are numbers if updated
        if (typeof updatedIngredient.calories !== 'number') updatedIngredient.calories = Number(updatedIngredient.calories) || 0;
        if (typeof updatedIngredient.protein !== 'number') updatedIngredient.protein = Number(updatedIngredient.protein) || 0;
        if (typeof updatedIngredient.carbs !== 'number') updatedIngredient.carbs = Number(updatedIngredient.carbs) || 0;
        if (typeof updatedIngredient.fats !== 'number') updatedIngredient.fats = Number(updatedIngredient.fats) || 0;
        if (typeof updatedIngredient.fiber !== 'number') updatedIngredient.fiber = Number(updatedIngredient.fiber) || 0;

        meal.ingredients[ingredientIndex] = updatedIngredient;

        const updatedData = recalculateTotals(dataForDay);

        try {
            await setDoc(this.getDocRef(date), updatedData);
            // Invalidate cache
            this.dataCacheManager.invalidate(`getDashboardForDate:${date}`);
            return updatedData;
        } catch (error) {
            console.error("Firestore update failed:", error);
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to update Firestore: ${message}`);
        }
    }

    async findIngredient(date: string, ingredientId: string): Promise<{ mealType: keyof MealSummary; ingredient: Ingredient } | null> {
        const dataForDay = await this.getDashboardForDate(date);

        for (const mealType of ['breakfast', 'lunch', 'dinner', 'snacks'] as const) {
            const meal = dataForDay.meals[mealType];
            const ingredient = meal.ingredients.find(ing => ing.id === ingredientId);
            if (ingredient) {
                return { mealType, ingredient };
            }
        }

        return null;
    }

    async updateGoals(date: string, goals: { calories: number; protein: number; carbs: number; fats: number }): Promise<DashboardData> {
        const dataForDay = await this.getDashboardForDate(date);

        // Update goals in the dashboard data
        dataForDay.macros.calories.goal = goals.calories;
        dataForDay.macros.protein.goal = goals.protein;
        dataForDay.macros.carbs.goal = goals.carbs;
        dataForDay.macros.fats.goal = goals.fats;

        // Save the updated data
        await setDoc(this.getDocRef(date), dataForDay);

        // Invalidate cache
        this.dataCacheManager.invalidate(`getDashboardForDate:${date}`);

        return dataForDay;
    }
}
