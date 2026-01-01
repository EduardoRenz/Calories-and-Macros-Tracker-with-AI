import { DailyHistoryEntry } from '../entities/history';

export interface HistoryRepository {
  getDailyHistory(params: { startDate: string; endDate: string }): Promise<DailyHistoryEntry[]>;
}
