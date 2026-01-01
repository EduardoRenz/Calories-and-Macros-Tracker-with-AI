import { HistoryRepository } from '../../domain/repositories/HistoryRepository';
import { DailyHistoryEntry } from '../../domain/entities/history';
import { RepositoryFactory } from '../RepositoryFactory';
import { DashboardRepository } from '../../domain/repositories/DashboardRepository';

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

  async getDailyHistory(params: { startDate: string; endDate: string }): Promise<DailyHistoryEntry[]> {
    const { startDate, endDate } = params;

    const dates = listDates(startDate, endDate);

    const dashboards = await Promise.all(dates.map(d => this.dashboardRepository.getDashboardForDate(d)));

    const entries = dashboards
      .map(data => {
        const hasEntry = Object.values(data.meals).some(meal => meal.ingredients.length > 0);
        return {
          date: data.date,
          protein: data.macros.protein.current,
          carbs: data.macros.carbs.current,
          fats: data.macros.fats.current,
          calories: data.macros.calories.current,
          calorieGoal: data.macros.calories.goal,
          hasEntry,
        };
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    return entries;
  }
}
