import { HistoryRepository, HistoryPage } from '../../domain/repositories/HistoryRepository';
import { DailyHistoryEntry } from '../../domain/entities/history';
import { getSupabaseClient } from '../supabaseClient';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';
import { CalorieCalculationService } from '../../domain/services/CalorieCalculationService';
import { SupabaseProfileRepository } from './SupabaseProfileRepository';
import { DataCacheManager } from '../infrastructure/DataCacheManager';

type DashboardDayRow = {
  id: string;
  date: string;
  calories_current: number;
  calories_goal: number;
  protein_current: number;
  carbs_current: number;
  fats_current: number;
};

type IngredientRow = {
  dashboard_day_id: string;
  fiber: number;
};

export class SupabaseHistoryRepository implements HistoryRepository {
  private profileRepository = new SupabaseProfileRepository();
  private concurrencyManager = new ConcurrencyRequestManager();
  private dataCacheManager = new DataCacheManager();

  private async getUserId(): Promise<string> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!data.user) throw new Error('No authenticated user found for history operations.');
    return data.user.id;
  }

  private async loadDays(userId: string, startDate: string, endDate: string): Promise<DashboardDayRow[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('dashboard_days')
      .select('id,date,calories_current,calories_goal,protein_current,carbs_current,fats_current')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data ?? []) as DashboardDayRow[];
  }

  private async loadFibersForDays(dayIds: string[]): Promise<Map<string, { fiber: number; hasEntry: boolean }>> {
    const result = new Map<string, { fiber: number; hasEntry: boolean }>();
    for (const id of dayIds) {
      result.set(id, { fiber: 0, hasEntry: false });
    }

    if (dayIds.length === 0) return result;

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('dashboard_ingredients')
      .select('dashboard_day_id,fiber')
      .in('dashboard_day_id', dayIds);

    if (error) throw error;

    for (const row of (data ?? []) as IngredientRow[]) {
      const current = result.get(row.dashboard_day_id) ?? { fiber: 0, hasEntry: false };
      current.fiber += Number(row.fiber ?? 0);
      current.hasEntry = true;
      result.set(row.dashboard_day_id, current);
    }

    return result;
  }

  async getDailyHistoryRange(params: { startDate: string; endDate: string }): Promise<DailyHistoryEntry[]> {
    const key = `getDailyHistoryRange:${params.startDate}:${params.endDate}`;
    return this.dataCacheManager.getCached(key, async () => {
      return this.concurrencyManager.run(key, async () => {
        const userId = await this.getUserId();

        const days = await this.loadDays(userId, params.startDate, params.endDate);

        const profile = await this.profileRepository.getProfile();
        const goals = CalorieCalculationService.calculateGoals(profile);

        const fibers = await this.loadFibersForDays(days.map(d => d.id));

        return days
          .map(d => {
            const extra = fibers.get(d.id) ?? { fiber: 0, hasEntry: false };
            return {
              date: d.date,
              protein: d.protein_current ?? 0,
              carbs: d.carbs_current ?? 0,
              fats: d.fats_current ?? 0,
              fiber: Math.round(extra.fiber),
              calories: d.calories_current ?? 0,
              calorieGoal: d.calories_goal ?? goals.calories,
              hasEntry: extra.hasEntry,
            };
          })
          .sort((a, b) => (a.date < b.date ? 1 : -1));
      });
    });
  }

  async getDailyHistoryPage(params: { startDate: string; endDate: string; pageSize: number; cursor?: string | null }): Promise<HistoryPage> {
    const key = `getDailyHistoryPage:${params.startDate}:${params.endDate}:${params.pageSize}:${params.cursor}`;
    return this.dataCacheManager.getCached(key, async () => {
      return this.concurrencyManager.run(key, async () => {
        const userId = await this.getUserId();

        const supabase = getSupabaseClient();

        let q = supabase
          .from('dashboard_days')
          .select('id,date,calories_current,calories_goal,protein_current,carbs_current,fats_current')
          .eq('user_id', userId)
          .gte('date', params.startDate)
          .lte('date', params.endDate)
          .order('date', { ascending: false })
          .limit(params.pageSize);

        if (params.cursor) {
          q = q.lt('date', params.cursor);
        }

        const { data, error } = await q;
        if (error) throw error;

        const days = (data ?? []) as DashboardDayRow[];

        const profile = await this.profileRepository.getProfile();
        const goals = CalorieCalculationService.calculateGoals(profile);

        const fibers = await this.loadFibersForDays(days.map(d => d.id));

        const items: DailyHistoryEntry[] = days.map(d => {
          const extra = fibers.get(d.id) ?? { fiber: 0, hasEntry: false };
          return {
            date: d.date,
            protein: d.protein_current ?? 0,
            carbs: d.carbs_current ?? 0,
            fats: d.fats_current ?? 0,
            fiber: Math.round(extra.fiber),
            calories: d.calories_current ?? 0,
            calorieGoal: d.calories_goal ?? goals.calories,
            hasEntry: extra.hasEntry,
          };
        });

        const nextCursor = days.length === params.pageSize ? days[days.length - 1]?.date ?? null : null;

        return { items, nextCursor };
      });
    });
  }
}
