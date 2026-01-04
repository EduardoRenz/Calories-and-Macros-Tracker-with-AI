import { FoodAnalysisRepository } from '../../domain/repositories/FoodAnalysisRepository';
import { DashboardData } from '../../domain/entities/dashboard';
import { SupabaseDashboardRepository } from './SupabaseDashboardRepository';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';
import { DataCacheManager } from '../infrastructure/DataCacheManager';

export class SupabaseFoodAnalysisRepository implements FoodAnalysisRepository {
  private dashboardRepository = new SupabaseDashboardRepository();
  private concurrencyManager = new ConcurrencyRequestManager();
  private dataCacheManager = new DataCacheManager();

  async getDashboardDataForRange(startDate: string, endDate: string): Promise<DashboardData[]> {
    const key = `getDashboardDataForRange:${startDate}:${endDate}`;
    return this.dataCacheManager.getCached(key, async () => {
      return this.concurrencyManager.run(key, async () => {
        const listDates = (start: string, end: string): string[] => {
          const parse = (yyyyMmDd: string) => {
            const [y, m, d] = yyyyMmDd.split('-').map(Number);
            return new Date(y, (m ?? 1) - 1, d ?? 1);
          };
          const format = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };

          const s = parse(start);
          const e = parse(end);
          const dates: string[] = [];
          const d = new Date(s);
          while (d <= e) {
            dates.push(format(d));
            d.setDate(d.getDate() + 1);
          }
          return dates;
        };

        const datesAsc = listDates(startDate, endDate);
        const dashboards = await Promise.all(datesAsc.map(d => this.dashboardRepository.getDashboardForDate(d)));
        dashboards.sort((a, b) => a.date.localeCompare(b.date));
        return dashboards;
      });
    });
  }
}
