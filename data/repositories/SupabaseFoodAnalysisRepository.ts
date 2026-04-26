import { FoodAnalysisRepository } from '../../domain/repositories/FoodAnalysisRepository';
import { DashboardData } from '../../domain/entities/dashboard';
import { RepositoryFactory } from '../RepositoryFactory';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';
import { DataCacheManager } from '../infrastructure/DataCacheManager';

export class SupabaseFoodAnalysisRepository implements FoodAnalysisRepository {
  private static instance: SupabaseFoodAnalysisRepository;
  private dashboardRepository = RepositoryFactory.getDashboardRepository();
  private concurrencyManager = new ConcurrencyRequestManager();
  private dataCacheManager = new DataCacheManager();

  private constructor() { }

  public static getInstance(): SupabaseFoodAnalysisRepository {
    if (!SupabaseFoodAnalysisRepository.instance) {
      SupabaseFoodAnalysisRepository.instance = new SupabaseFoodAnalysisRepository();
    }
    return SupabaseFoodAnalysisRepository.instance;
  }

  async getDashboardDataForRange(startDate: string, endDate: string): Promise<DashboardData[]> {
    const key = `getDashboardDataForRange:${startDate}:${endDate}`;
    return this.dataCacheManager.getCached(key, async () => {
      return this.concurrencyManager.run(key, async () => {
        return this.dashboardRepository.getDashboardRange(startDate, endDate);
      });
    });
  }
}
