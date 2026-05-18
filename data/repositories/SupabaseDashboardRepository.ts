import { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import { DashboardData, Ingredient, MealSummary } from '../../domain/entities/dashboard';
import { getSupabaseClient } from '../supabaseClient';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';
import { DataCacheManager } from '../infrastructure/DataCacheManager';
import { SupabaseUserSession } from '../infrastructure/SupabaseUserSession';

type DashboardDayRow = {
  id: string;
  user_id: string;
  date: string;
  calories_current: number;
  calories_goal: number;
  protein_current: number;
  protein_goal: number;
  carbs_current: number;
  carbs_goal: number;
  fats_current: number;
  fats_goal: number;
};

type DashboardIngredientRow = {
  id: string;
  dashboard_day_id: string;
  meal_type: keyof MealSummary;
  name: string;
  category: string | null;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  created_at: string;
};

const createEmptyDashboard = (date: string, goals?: { calories: number; protein: number; carbs: number; fats: number }): DashboardData => ({
  date,
  macros: {
    calories: { current: 0, goal: goals?.calories ?? 0 },
    protein: { current: 0, goal: goals?.protein ?? 0 },
    carbs: { current: 0, goal: goals?.carbs ?? 0 },
    fats: { current: 0, goal: goals?.fats ?? 0 },
  },
  meals: {
    breakfast: { name: 'Breakfast', calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, ingredients: [] },
    lunch: { name: 'Lunch', calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, ingredients: [] },
    dinner: { name: 'Dinner', calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, ingredients: [] },
    snacks: { name: 'Snacks', calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, ingredients: [] },
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

export class SupabaseDashboardRepository implements DashboardRepository {
  private static instance: SupabaseDashboardRepository;
  private concurrencyManager: ConcurrencyRequestManager = new ConcurrencyRequestManager();
  private dataCacheManager: DataCacheManager = new DataCacheManager();

  private constructor() { }

  public static getInstance(): SupabaseDashboardRepository {
    if (!SupabaseDashboardRepository.instance) {
      SupabaseDashboardRepository.instance = new SupabaseDashboardRepository();
    }
    return SupabaseDashboardRepository.instance;
  }

  private async getUserId(): Promise<string> {
    return SupabaseUserSession.getInstance().getUserId();
  }

  private async getOrCreateDashboardDay(date: string): Promise<DashboardDayRow> {
    const supabase = getSupabaseClient();
    const userId = await this.getUserId();

    const { data: existing, error: existingError } = await supabase
      .from('dashboard_days')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      return existing as DashboardDayRow;
    }

    const { data: created, error: createError } = await supabase
      .from('dashboard_days')
      .insert({
        user_id: userId,
        date,
        calories_current: 0,
        calories_goal: 0,
        protein_current: 0,
        protein_goal: 0,
        carbs_current: 0,
        carbs_goal: 0,
        fats_current: 0,
        fats_goal: 0,
      })
      .select('*')
      .single();

    if (createError) throw createError;

    return created as DashboardDayRow;
  }

  private async loadIngredients(dayId: string): Promise<DashboardIngredientRow[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('dashboard_ingredients')
      .select('id,dashboard_day_id,meal_type,name,category,quantity,calories,protein,carbs,fats,fiber,created_at')
      .eq('dashboard_day_id', dayId);

    if (error) throw error;
    return (data ?? []) as DashboardIngredientRow[];
  }

  private toDashboardData(date: string, goals: { calories: number; protein: number; carbs: number; fats: number }, ingredients: DashboardIngredientRow[]): DashboardData {
    const base = createEmptyDashboard(date, goals);

    for (const row of ingredients) {
      const ing: Ingredient = {
        id: row.id,
        name: row.name,
        category: row.category || undefined,
        quantity: row.quantity || '1',
        calories: row.calories,
        protein: row.protein,
        carbs: row.carbs,
        fats: row.fats,
        fiber: row.fiber,
        created_at: row.created_at,
      };

      base.meals[row.meal_type].ingredients.push(ing);
    }

    return recalculateTotals(base);
  }

  private async persistTotals(dayId: string, data: DashboardData): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('dashboard_days')
      .update({
        calories_current: data.macros.calories.current,
        protein_current: data.macros.protein.current,
        carbs_current: data.macros.carbs.current,
        fats_current: data.macros.fats.current,

      })
      .eq('id', dayId);

    if (error) throw error;
  }

  async getDashboardForDate(date: string): Promise<DashboardData> {
    const key = `getDashboardForDate:${date}`;
    return this.dataCacheManager.getCached(key, async () => {
      return this.concurrencyManager.run(key, async () => {
        const day = await this.getOrCreateDashboardDay(date);
        const goals = {
          calories: day.calories_goal ?? 0,
          protein: day.protein_goal ?? 0,
          carbs: day.carbs_goal ?? 0,
          fats: day.fats_goal ?? 0,
        };

        const ingredients = await this.loadIngredients(day.id);
        const data = this.toDashboardData(date, goals, ingredients);

        await this.persistTotals(day.id, data);

        return data;
      });
    });
  }

  async getDashboardRange(startDate: string, endDate: string): Promise<DashboardData[]> {
    const key = `getDashboardRange:${startDate}:${endDate}`;
    return this.dataCacheManager.getCached(key, async () => {
      return this.concurrencyManager.run(key, async () => {
        const userId = await this.getUserId();
        const supabase = getSupabaseClient();

        // 1. Fetch days
        const { data: days, error: daysError } = await supabase
          .from('dashboard_days')
          .select('*')
          .eq('user_id', userId)
          .gte('date', startDate)
          .lte('date', endDate);

        if (daysError) throw daysError;

        const dayRows = (days ?? []) as DashboardDayRow[];
        const dayIds = dayRows.map(d => d.id);

        // 2. Fetch ingredients for those days
        let ingredientRows: DashboardIngredientRow[] = [];
        if (dayIds.length > 0) {
          const { data: ings, error: ingsError } = await supabase
            .from('dashboard_ingredients')
            .select('id,dashboard_day_id,meal_type,name,category,quantity,calories,protein,carbs,fats,fiber,created_at')
            .in('dashboard_day_id', dayIds);

          if (ingsError) throw ingsError;
          ingredientRows = (ings ?? []) as DashboardIngredientRow[];
        }

        // 3. Prepare result map
        const result: DashboardData[] = [];
        const daysMap = new Map(dayRows.map(d => [d.date, d]));
        const ingredientsMap = new Map<string, DashboardIngredientRow[]>();

        for (const ing of ingredientRows) {
          if (!ingredientsMap.has(ing.dashboard_day_id)) {
            ingredientsMap.set(ing.dashboard_day_id, []);
          }
          ingredientsMap.get(ing.dashboard_day_id)!.push(ing);
        }

        const defaultGoals = { calories: 0, protein: 0, carbs: 0, fats: 0 };

        // 5. Build seamless range
        const listDates = (start: string, end: string): string[] => {
          const result: string[] = [];
          let current = new Date(start + 'T00:00:00'); // Ensure TZ correctness by using basic ISO
          const last = new Date(end + 'T00:00:00');
          // Check if parsing failed (simple workaround for yyyy-mm-dd)
          if (isNaN(current.getTime())) {
            const [y, m, d] = start.split('-').map(Number);
            current = new Date(y, m - 1, d);
          }
          let lastDate = last;
          if (isNaN(last.getTime())) {
            const [y, m, d] = end.split('-').map(Number);
            lastDate = new Date(y, m - 1, d);
          }

          // Simple loop
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

        for (const date of allDates) {
          const dayRow = daysMap.get(date);
          if (dayRow) {
            // Existing day
            const dayIngredients = ingredientsMap.get(dayRow.id) ?? [];
            // We use calculateGoals(profile) as fallback, but ideally we should use stored goals in dayRow
            // However, the toDashboardData helper currently takes 'goals' as unified input.
            // Let's rely on toDashboardData's internal logic or pass specific goals if we want to respect history.
            // toDashboardData uses the PASSED goals effectively setting them as 'goal' in macros.
            // But the dayRow has stored goals: dayRow.calories_goal, etc.
            const historicGoals = {
              calories: dayRow.calories_goal,
              protein: dayRow.protein_goal ?? defaultGoals.protein,
              carbs: dayRow.carbs_goal ?? defaultGoals.carbs,
              fats: dayRow.fats_goal ?? defaultGoals.fats,
            };

            result.push(this.toDashboardData(date, historicGoals, dayIngredients));
          } else {
            // Missing day - Return ephemeral empty dashboard (mimicking creation but not saving)
            result.push(createEmptyDashboard(date, defaultGoals));
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
    const supabase = getSupabaseClient();
    const userId = await this.getUserId();

    const day = await this.getOrCreateDashboardDay(date);

    const rows = ingredients.map(ing => ({
      user_id: userId,
      dashboard_day_id: day.id,
      meal_type: mealType,
      name: ing.name,
      category: ing.category || null,
      quantity: ing.quantity,
      calories: ing.calories,
      protein: ing.protein,
      carbs: ing.carbs,
      fats: ing.fats,
      fiber: typeof (ing as any).fiber === 'number' ? (ing as any).fiber : 0,
    }));

    const { error, data } = await supabase.from('dashboard_ingredients').insert(rows);
    if (error) {
      throw error;
    }

    const goals = {
      calories: day.calories_goal ?? 0,
      protein: day.protein_goal ?? 0,
      carbs: day.carbs_goal ?? 0,
      fats: day.fats_goal ?? 0,
    };

    const refreshedIngredients = await this.loadIngredients(day.id);
    const updated = this.toDashboardData(date, goals, refreshedIngredients);

    await this.persistTotals(day.id, updated);

    // Invalidate cache for this date
    this.dataCacheManager.invalidate(`getDashboardForDate:${date}`);

    return updated;
  }

  async removeIngredient(date: string, mealType: keyof MealSummary, ingredientId: string): Promise<DashboardData> {
    const supabase = getSupabaseClient();

    const day = await this.getOrCreateDashboardDay(date);

    const { error } = await supabase
      .from('dashboard_ingredients')
      .delete()
      .eq('id', ingredientId)
      .eq('dashboard_day_id', day.id)
      .eq('meal_type', mealType as any);

    if (error) throw error;

    const goals = {
      calories: day.calories_goal ?? 0,
      protein: day.protein_goal ?? 0,
      carbs: day.carbs_goal ?? 0,
      fats: day.fats_goal ?? 0,
    };

    const refreshedIngredients = await this.loadIngredients(day.id);
    const updated = this.toDashboardData(date, goals, refreshedIngredients);

    await this.persistTotals(day.id, updated);

    // Invalidate cache for this date
    this.dataCacheManager.invalidate(`getDashboardForDate:${date}`);

    return updated;
  }

  async updateIngredient(date: string, mealType: keyof MealSummary, ingredientId: string, updates: Partial<Ingredient>): Promise<DashboardData> {
    const supabase = getSupabaseClient();
    const day = await this.getOrCreateDashboardDay(date);

    const { error } = await supabase
      .from('dashboard_ingredients')
      .update({
        name: updates.name,
        quantity: updates.quantity,
        calories: updates.calories,
        protein: updates.protein,
        carbs: updates.carbs,
        fats: updates.fats,
        fiber: updates.fiber,
      })
      .eq('id', ingredientId)
      .eq('dashboard_day_id', day.id);

    if (error) throw error;

    const goals = {
      calories: day.calories_goal ?? 0,
      protein: day.protein_goal ?? 0,
      carbs: day.carbs_goal ?? 0,
      fats: day.fats_goal ?? 0,
    };

    const refreshedIngredients = await this.loadIngredients(day.id);
    const updated = this.toDashboardData(date, goals, refreshedIngredients);

    await this.persistTotals(day.id, updated);

    // Invalidate cache for this date
    this.dataCacheManager.invalidate(`getDashboardForDate:${date}`);

    return updated;
  }

  async findIngredient(date: string, ingredientId: string): Promise<{ mealType: keyof MealSummary; ingredient: Ingredient } | null> {
    const day = await this.getOrCreateDashboardDay(date);
    const ingredients = await this.loadIngredients(day.id);

    for (const row of ingredients) {
      if (row.id === ingredientId) {
        return {
          mealType: row.meal_type,
          ingredient: {
            id: row.id,
            name: row.name,
            category: row.category || undefined,
            quantity: row.quantity || '1',
            calories: row.calories,
            protein: row.protein,
            carbs: row.carbs,
            fats: row.fats,
            fiber: row.fiber,
            created_at: row.created_at,
          }
        };
      }
    }

    return null;
  }

  async updateGoals(date: string, goals: { calories: number; protein: number; carbs: number; fats: number }): Promise<DashboardData> {
    const supabase = getSupabaseClient();
    const day = await this.getOrCreateDashboardDay(date);

    // Update goals in database
    const { error } = await supabase
      .from('dashboard_days')
      .update({
        calories_goal: goals.calories,
        protein_goal: goals.protein,
        carbs_goal: goals.carbs,
        fats_goal: goals.fats,
      })
      .eq('id', day.id);

    if (error) throw error;

    // Load current ingredients and recalculate dashboard with new goals
    const ingredients = await this.loadIngredients(day.id);
    const updated = this.toDashboardData(date, goals, ingredients);

    // Persist the updated totals (though goals are already updated above)
    await this.persistTotals(day.id, updated);

    // Invalidate cache for this date
    this.dataCacheManager.invalidate(`getDashboardForDate:${date}`);

    return updated;
  }
}
