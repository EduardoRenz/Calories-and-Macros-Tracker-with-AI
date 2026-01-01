import { DailyHistoryEntry } from '../entities/history';
import { HistoryRepository, HistoryPage } from '../repositories/HistoryRepository';

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

export type HistoryAverages = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export class HistoryService {
  constructor(private repository: HistoryRepository) {}

  async getDailyHistoryPage(params: { startDate: string; endDate: string; pageSize: number; cursor?: string | null; }): Promise<HistoryPage> {
    return this.repository.getDailyHistoryPage(params);
  }

  async getDailyHistoryRange(params: { startDate: string; endDate: string }): Promise<DailyHistoryEntry[]> {
    return this.repository.getDailyHistoryRange(params);
  }

  async getAveragesForRange(params: { startDate: string; endDate: string; maxItems?: number; }): Promise<{ averages: HistoryAverages; daysWithEntries: number; }>{
    const maxItems = params.maxItems ?? 500;
    const pageSize = 100;

    let cursor: string | null | undefined = null;
    let processed = 0;

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let daysWithEntries = 0;

    while (processed < maxItems) {
      const page = await this.repository.getDailyHistoryPage({
        startDate: params.startDate,
        endDate: params.endDate,
        pageSize,
        cursor,
      });

      for (const item of page.items) {
        processed += 1;
        if (!item.hasEntry) continue;
        daysWithEntries += 1;
        totalCalories += item.calories;
        totalProtein += item.protein;
        totalCarbs += item.carbs;
        totalFats += item.fats;
      }

      if (!page.nextCursor) break;
      cursor = page.nextCursor;

      if (page.items.length < pageSize) break;
    }

    const averages: HistoryAverages = {
      calories: daysWithEntries > 0 ? Math.round(totalCalories / daysWithEntries) : 0,
      protein: daysWithEntries > 0 ? Math.round(totalProtein / daysWithEntries) : 0,
      carbs: daysWithEntries > 0 ? Math.round(totalCarbs / daysWithEntries) : 0,
      fats: daysWithEntries > 0 ? Math.round(totalFats / daysWithEntries) : 0,
    };

    return { averages, daysWithEntries };
  }

  getDefaultLast30DaysRange(): { startDate: string; endDate: string } {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 29);

    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
    };
  }

  getMonthRange(dateInMonth: Date): { startDate: string; endDate: string } {
    const start = new Date(dateInMonth.getFullYear(), dateInMonth.getMonth(), 1);
    const end = new Date(dateInMonth.getFullYear(), dateInMonth.getMonth() + 1, 0);
    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
    };
  }
}
