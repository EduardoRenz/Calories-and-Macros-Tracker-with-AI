import { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import { DashboardData, Ingredient, MealSummary } from '../../domain/entities/dashboard';
import { CalorieCalculationService } from '../../domain/services/CalorieCalculationService';
import { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import { SupabaseProfileRepository } from './SupabaseProfileRepository';
import { getSupabaseClient } from '../supabaseClient';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';
import { DataCacheManager } from '../infrastructure/DataCacheManager';

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
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
};

const createEmptyDashboard = (date: string, goals: { calories: number; protein: number; carbs: number; fats: number }): DashboardData => ({
  date,
  macros: {
    calories: { current: 0, goal: goals.calories },
    protein: { current: 0, goal: goals.protein },
    carbs: { current: 0, goal: goals.carbs },
    fats: { current: 0, goal: goals.fats },
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
  private profileRepository: ProfileRepository = new SupabaseProfileRepository();
  private concurrencyManager: ConcurrencyRequestManager = new ConcurrencyRequestManager();
  private dataCacheManager: DataCacheManager = new DataCacheManager();

  private async getUserId(): Promise<string> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!data.user) throw new Error('No authenticated user found for dashboard operations.');
    return data.user.id;
  }

  private async getOrCreateDashboardDay(date: string): Promise<DashboardDayRow> {
    const supabase = getSupabaseClient();
    const userId = await this.getUserId();

    const profile = await this.profileRepository.getProfile();
    const goals = CalorieCalculationService.calculateGoals(profile);

    const { data: existing, error: existingError } = await supabase
      .from('dashboard_days')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      const needsGoalUpdate =
        existing.calories_goal !== goals.calories ||
        existing.protein_goal !== goals.protein ||
        existing.carbs_goal !== goals.carbs ||
        existing.fats_goal !== goals.fats;

      if (needsGoalUpdate) {
        const { data: updated, error: updateError } = await supabase
          .from('dashboard_days')
          .update({
            calories_goal: goals.calories,
            protein_goal: goals.protein,
            carbs_goal: goals.carbs,
            fats_goal: goals.fats,
          })
          .eq('id', existing.id)
          .select('*')
          .single();

        if (updateError) throw updateError;
        return updated as DashboardDayRow;
      }

      return existing as DashboardDayRow;
    }

    const { data: created, error: createError } = await supabase
      .from('dashboard_days')
      .insert({
        user_id: userId,
        date,
        calories_current: 0,
        calories_goal: goals.calories,
        protein_current: 0,
        protein_goal: goals.protein,
        carbs_current: 0,
        carbs_goal: goals.carbs,
        fats_current: 0,
        fats_goal: goals.fats,
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
      .select('id,dashboard_day_id,meal_type,name,calories,protein,carbs,fats,fiber')
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
        quantity: '1',
        calories: row.calories,
        protein: row.protein,
        carbs: row.carbs,
        fats: row.fats,
        fiber: row.fiber,
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

        const profile = await this.profileRepository.getProfile();
        const goals = CalorieCalculationService.calculateGoals(profile);

        const ingredients = await this.loadIngredients(day.id);
        const data = this.toDashboardData(date, goals, ingredients);

        await this.persistTotals(day.id, data);

        return data;
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
      calories: ing.calories,
      protein: ing.protein,
      carbs: ing.carbs,
      fats: ing.fats,
      fiber: typeof (ing as any).fiber === 'number' ? (ing as any).fiber : 0,
    }));

    const { error } = await supabase.from('dashboard_ingredients').insert(rows);
    if (error) throw error;

    const profile = await this.profileRepository.getProfile();
    const goals = CalorieCalculationService.calculateGoals(profile);

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

    const profile = await this.profileRepository.getProfile();
    const goals = CalorieCalculationService.calculateGoals(profile);

    const refreshedIngredients = await this.loadIngredients(day.id);
    const updated = this.toDashboardData(date, goals, refreshedIngredients);

    await this.persistTotals(day.id, updated);

    // Invalidate cache for this date
    this.dataCacheManager.invalidate(`getDashboardForDate:${date}`);

    return updated;
  }
}
