import { HistoryRepository, HistoryPage } from '@/domain/repositories/HistoryRepository';
import { DailyHistoryEntry } from '@/domain/entities/history';
import { apiClient } from '@/lib/apiClient';

/**
 * HistoryRepository implementation that calls the server-side API.
 * All requests are authenticated via the Authorization header.
 */
export class ApiHistoryRepository implements HistoryRepository {
    async getDailyHistoryPage(params: {
        startDate: string;
        endDate: string;
        pageSize: number;
        cursor?: string | null;
    }): Promise<HistoryPage> {
        return apiClient.post<HistoryPage>('/api/history/page', params);
    }

    async getDailyHistoryRange(params: {
        startDate: string;
        endDate: string;
    }): Promise<DailyHistoryEntry[]> {
        return apiClient.post<DailyHistoryEntry[]>('/api/history/range', params);
    }
}
