import { HistoryRepository } from '../../domain/repositories/HistoryRepository';
import { DailyHistoryEntry } from '../../domain/entities/history';
import { HistoryPage } from '../../domain/repositories/HistoryRepository';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';
import { DataCacheManager } from '../infrastructure/DataCacheManager';

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
  private concurrencyManager = new ConcurrencyRequestManager();
  private dataCacheManager = new DataCacheManager();
  private dailyDataStore = new Map<string, DailyHistoryEntry>();
  private isSeeded = false;

  private seedMockHistory = async () => {
    if (this.isSeeded) return;

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

    // Day 1: Over calories (2700) - positive balance
    this.dailyDataStore.set(d1, {
      date: d1,
      protein: 143,
      carbs: 295,
      fats: 93,
      fiber: 88,
      calories: 2700,
      calorieGoal: 2000,
      hasEntry: true,
    });

    // Day 2: Under calories (740) - negative balance
    this.dailyDataStore.set(d2, {
      date: d2,
      protein: 55,
      carbs: 40,
      fats: 35,
      fiber: 35,
      calories: 740,
      calorieGoal: 2000,
      hasEntry: true,
    });

    // Day 3: No entry
    this.dailyDataStore.set(d3, {
      date: d3,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      calories: 0,
      calorieGoal: 2000,
      hasEntry: false,
    });

    // Day 4: Over calories (2200) - positive balance
    this.dailyDataStore.set(d4, {
      date: d4,
      protein: 120,
      carbs: 250,
      fats: 80,
      fiber: 60,
      calories: 2200,
      calorieGoal: 2000,
      hasEntry: true,
    });

    // Day 5: Full day, under calories (1610) - negative balance
    this.dailyDataStore.set(d5, {
      date: d5,
      protein: 106,
      carbs: 190,
      fats: 37,
      fiber: 31,
      calories: 1610,
      calorieGoal: 2000,
      hasEntry: true,
    });

    // Day 6: Over calories (1450) - negative balance
    this.dailyDataStore.set(d6, {
      date: d6,
      protein: 48,
      fats: 75,
      carbs: 135,
      fiber: 75,
      calories: 1450,
      calorieGoal: 2000,
      hasEntry: true,
    });

    // Day 7: Under calories (930) - negative balance
    this.dailyDataStore.set(d7, {
      date: d7,
      protein: 50,
      carbs: 100,
      fats: 34,
      fiber: 34,
      calories: 930,
      calorieGoal: 2000,
      hasEntry: true,
    });

    this.isSeeded = true;
  };

  async getDailyHistoryRange(params: { startDate: string; endDate: string }): Promise<DailyHistoryEntry[]> {
    const key = `getDailyHistoryRange:${params.startDate}:${params.endDate}`;
    return this.dataCacheManager.getCached(key, async () => {
      return this.concurrencyManager.run(key, async () => {
        await this.seedMockHistory();
        
        const { startDate, endDate } = params;
        const dates = listDates(startDate, endDate);
        
        return dates
          .map(date => this.dailyDataStore.get(date))
          .filter((entry): entry is DailyHistoryEntry => entry !== undefined)
          .sort((a, b) => (a.date < b.date ? 1 : -1));
      });
    });
  }

  async getDailyHistoryPage(params: { startDate: string; endDate: string; pageSize: number; cursor?: string | null; }): Promise<HistoryPage> {
    const key = `getDailyHistoryPage:${params.startDate}:${params.endDate}:${params.pageSize}:${params.cursor}`;
    return this.dataCacheManager.getCached(key, async () => {
      return this.concurrencyManager.run(key, async () => {
        await this.seedMockHistory();
        
        const { startDate, endDate, pageSize, cursor } = params;
        const dates = listDates(startDate, endDate);
        const entries = dates
          .map(date => this.dailyDataStore.get(date))
          .filter((entry): entry is DailyHistoryEntry => entry !== undefined)
          .sort((a, b) => (a.date < b.date ? 1 : -1));

        const startIndex = cursor ? Math.max(0, entries.findIndex(e => e.date === cursor) + 1) : 0;
        const items = entries.slice(startIndex, startIndex + pageSize);
        const nextCursor = items.length === pageSize ? items[items.length - 1]?.date ?? null : null;

        return { items, nextCursor };
      });
    });
  }
}
