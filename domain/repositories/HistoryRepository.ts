import { DailyHistoryEntry } from '../entities/history';

export type HistoryPage = {
  items: DailyHistoryEntry[];
  nextCursor: string | null;
};

export interface HistoryRepository {
  getDailyHistoryPage(params: {
    startDate: string;
    endDate: string;
    pageSize: number;
    cursor?: string | null;
  }): Promise<HistoryPage>;

  getDailyHistoryRange(params: { startDate: string; endDate: string }): Promise<DailyHistoryEntry[]>;
}
