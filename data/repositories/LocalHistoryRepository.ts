import { HistoryRepository } from '../../domain/repositories/HistoryRepository';
import { DailyHistoryEntry } from '../../domain/entities/history';
import { RepositoryFactory } from '../RepositoryFactory';
import { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import { HistoryPage } from '../../domain/repositories/HistoryRepository';

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

export class LocalHistoryRepository implements HistoryRepository {
  private dashboardRepository: DashboardRepository = RepositoryFactory.getDashboardRepository();

  async getDailyHistoryRange(params: { startDate: string; endDate: string }): Promise<DailyHistoryEntry[]> {
    const { startDate, endDate } = params;

    const datesAsc = listDates(startDate, endDate);
    const dashboards = await Promise.all(datesAsc.map(d => this.dashboardRepository.getDashboardForDate(d)));

    return dashboards
      .map(data => {
        const hasEntry = Object.values(data.meals).some(meal => meal.ingredients.length > 0);
        const fiber = Object.values(data.meals).reduce((total: number, meal: any) => 
          total + meal.ingredients.reduce((mealTotal: number, ingredient: any) => mealTotal + (ingredient.fiber || 0), 0), 0
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
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  async getDailyHistoryPage(params: { startDate: string; endDate: string; pageSize: number; cursor?: string | null; }): Promise<HistoryPage> {
    const { startDate, endDate, pageSize, cursor } = params;

    const datesDesc = listDates(startDate, endDate).sort((a, b) => (a < b ? 1 : -1));
    const startIndex = cursor ? Math.max(0, datesDesc.findIndex(d => d === cursor) + 1) : 0;
    const pageDates = datesDesc.slice(startIndex, startIndex + pageSize);

    const dashboards = await Promise.all(pageDates.map(d => this.dashboardRepository.getDashboardForDate(d)));

    const items: DailyHistoryEntry[] = dashboards.map(data => {
      const hasEntry = Object.values(data.meals).some(meal => meal.ingredients.length > 0);
      const fiber = Object.values(data.meals).reduce((total: number, meal: any) => 
        total + meal.ingredients.reduce((mealTotal: number, ingredient: any) => mealTotal + (ingredient.fiber || 0), 0), 0
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
    });

    const nextCursor = pageDates.length === pageSize ? pageDates[pageDates.length - 1] : null;

    return { items, nextCursor };
  }
}
