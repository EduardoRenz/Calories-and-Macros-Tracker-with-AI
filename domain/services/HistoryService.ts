import { DailyHistoryEntry } from '../entities/history';
import { HistoryRepository } from '../repositories/HistoryRepository';

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

export type HistoryResult = {
  entries: DailyHistoryEntry[];
  averages: HistoryAverages;
  daysWithEntries: number;
};

export class HistoryService {
  constructor(private repository: HistoryRepository) {}

  async getDailyHistoryWithGaps(params: { startDate: string; endDate: string }): Promise<HistoryResult> {
    const fetched = await this.repository.getDailyHistory(params);

    const byDate = new Map<string, DailyHistoryEntry>();
    for (const e of fetched) {
      byDate.set(e.date, e);
    }

    const defaultGoal = fetched[0]?.calorieGoal ?? 0;

    const entriesAsc = listDates(params.startDate, params.endDate).map(date => {
      const existing = byDate.get(date);
      if (existing) return existing;

      return {
        date,
        protein: 0,
        carbs: 0,
        fats: 0,
        calories: 0,
        calorieGoal: defaultGoal,
        hasEntry: false,
      };
    });

    const entriesDesc = [...entriesAsc].sort((a, b) => (a.date < b.date ? 1 : -1));

    const withEntries = entriesAsc.filter(e => e.hasEntry);
    const daysWithEntries = withEntries.length;

    const averages: HistoryAverages = {
      calories: daysWithEntries > 0 ? Math.round(withEntries.reduce((s, e) => s + e.calories, 0) / daysWithEntries) : 0,
      protein: daysWithEntries > 0 ? Math.round(withEntries.reduce((s, e) => s + e.protein, 0) / daysWithEntries) : 0,
      carbs: daysWithEntries > 0 ? Math.round(withEntries.reduce((s, e) => s + e.carbs, 0) / daysWithEntries) : 0,
      fats: daysWithEntries > 0 ? Math.round(withEntries.reduce((s, e) => s + e.fats, 0) / daysWithEntries) : 0,
    };

    return { entries: entriesDesc, averages, daysWithEntries };
  }
}
