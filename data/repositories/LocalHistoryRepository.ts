import { HistoryRepository } from '../../domain/repositories/HistoryRepository';
import { DailyHistoryEntry } from '../../domain/entities/history';
import { RepositoryFactory } from '../RepositoryFactory';
import { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import { HistoryPage } from '../../domain/repositories/HistoryRepository';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';

const parseDate = (yyyyMmDd: string) => {
  const [y, m, d] = yyyyMmDd.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const listDates = (startDate: string, endDate: string): string[] => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  const dates: string[] = [];
  const d = new Date(start);
  while (d <= end) {
    dates.push(formatDate(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
};

import { DataCacheManager } from '../infrastructure/DataCacheManager';

export class LocalHistoryRepository implements HistoryRepository {
  private dashboardRepository: DashboardRepository = RepositoryFactory.getDashboardRepository();
  private concurrencyManager = new ConcurrencyRequestManager();
  private dataCacheManager = new DataCacheManager();

  private toDailyHistoryEntry(data: any): DailyHistoryEntry {
    const hasEntry = Object.values(data.meals).some((meal: any) => meal.ingredients.length > 0);
    const fiber = Object.values(data.meals).reduce(
      (total: number, meal: any) => total + meal.ingredients.reduce((mealTotal: number, ingredient: any) => mealTotal + (ingredient.fiber || 0), 0),
      0
    );

    return {
      date: data.date,
      protein: data.macros.protein.current,
      carbs: data.macros.carbs.current,
      fats: data.macros.fats.current,
      fiber,
      calories: data.macros.calories.current,
      calorieGoal: data.macros.calories.goal,
      hasEntry,
    };
  }

  async getDailyHistoryRange(params: { startDate: string; endDate: string }): Promise<DailyHistoryEntry[]> {
    const key = `getDailyHistoryRange:${params.startDate}:${params.endDate}`;
    return this.dataCacheManager.getCached(key, async () => {
      return this.concurrencyManager.run(key, async () => {
        const { startDate, endDate } = params;

        const dashboards = await this.dashboardRepository.getDashboardRange(startDate, endDate);

        return dashboards.map(d => this.toDailyHistoryEntry(d)).sort((a, b) => (a.date < b.date ? 1 : -1));
      });
    });
  }

  async getDailyHistoryPage(params: { startDate: string; endDate: string; pageSize: number; cursor?: string | null; }): Promise<HistoryPage> {
    const key = `getDailyHistoryPage:${params.startDate}:${params.endDate}:${params.pageSize}:${params.cursor}`;
    return this.dataCacheManager.getCached(key, async () => {
      return this.concurrencyManager.run(key, async () => {
        const { startDate, endDate, pageSize, cursor } = params;

        const dashboards = await this.dashboardRepository.getDashboardRange(startDate, endDate);
        const entries = dashboards
          .map(d => this.toDailyHistoryEntry(d))
          .sort((a, b) => (a.date < b.date ? 1 : -1));

        const startIndex = cursor ? Math.max(0, entries.findIndex(e => e.date === cursor) + 1) : 0;
        const items = entries.slice(startIndex, startIndex + pageSize);
        const nextCursor = items.length === pageSize ? items[items.length - 1]?.date ?? null : null;

        return { items, nextCursor };
      });
    });
  }
}
