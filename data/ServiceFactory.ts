import { FoodAnalysisService } from '../domain/services/FoodAnalysisService';
import { GeminiFoodAnalysisService } from './services/GeminiFoodAnalysisService';
import { MockFoodAnalysisService } from './services/MockFoodAnalysisService';

const USE_MOCKS = process.env.USE_MOCKS === 'true';

export class ServiceFactory {
    public static getFoodAnalysisService(): FoodAnalysisService {
        if (!USE_MOCKS) {
            return new GeminiFoodAnalysisService();
        }
        return new MockFoodAnalysisService();
    }
}
