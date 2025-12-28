import { FoodAnalysisRepository } from '../../domain/repositories/FoodAnalysisRepository';
import { DashboardData, MealSummary } from '../../domain/entities/dashboard';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getDb } from '../firebase';
import { getAuth } from '../auth';

export class FirestoreFoodAnalysisRepository implements FoodAnalysisRepository {
    private auth = getAuth();

    async getDashboardDataForRange(startDate: string, endDate: string): Promise<DashboardData[]> {
        const user = this.auth.currentUser;
        if (!user) {
            throw new Error("No authenticated user found for food analysis operations.");
        }

        const dashboardCollection = collection(getDb(), 'users', user.uid, 'dashboard_data');
        const q = query(
            dashboardCollection,
            where('date', '>=', startDate),
            where('date', '<=', endDate)
        );

        const querySnapshot = await getDocs(q);
        const dashboardData: DashboardData[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data() as DashboardData;
            dashboardData.push(data);
        });

        // Sort by date
        dashboardData.sort((a, b) => a.date.localeCompare(b.date));

        return dashboardData;
    }
}
