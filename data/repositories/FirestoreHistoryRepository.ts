import { collection, getDocs, orderBy, query, startAt, endAt, documentId } from 'firebase/firestore';

import { HistoryRepository } from '../../domain/repositories/HistoryRepository';
import { DailyHistoryEntry } from '../../domain/entities/history';
import { getDb } from '../firebase';
import { getAuth } from '../auth';
import { DashboardData, MealSummary } from '../../domain/entities/dashboard';
import { CalorieCalculationService } from '../../domain/services/CalorieCalculationService';
import { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import { FirestoreProfileRepository } from './FirestoreProfileRepository';

const hasAnyIngredients = (meals?: MealSummary): boolean => {
  if (!meals) return false;
  return Object.values(meals).some(meal => (meal?.ingredients?.length ?? 0) > 0);
};

export class FirestoreHistoryRepository implements HistoryRepository {
  private auth = getAuth();
  private profileRepository: ProfileRepository = new FirestoreProfileRepository();

  async getDailyHistory(params: { startDate: string; endDate: string }): Promise<DailyHistoryEntry[]> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found for history operations.');
    }

    const { startDate, endDate } = params;

    const colRef = collection(getDb(), 'users', user.uid, 'dashboard_data');
    const q = query(
      colRef,
      orderBy(documentId()),
      startAt(startDate),
      endAt(endDate)
    );

    const snap = await getDocs(q);

    const profile = await this.profileRepository.getProfile();
    const goals = CalorieCalculationService.calculateGoals(profile);

    const entries: DailyHistoryEntry[] = snap.docs
      .map(d => {
        const data = d.data() as DashboardData;
        const calories = data?.macros?.calories?.current ?? 0;
        const calorieGoal = data?.macros?.calories?.goal ?? goals.calories;
        const protein = data?.macros?.protein?.current ?? 0;
        const carbs = data?.macros?.carbs?.current ?? 0;
        const fats = data?.macros?.fats?.current ?? 0;

        const hasEntry = hasAnyIngredients(data?.meals);

        return {
          date: data?.date ?? d.id,
          protein,
          carbs,
          fats,
          calories,
          calorieGoal,
          hasEntry,
        };
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    return entries;
  }
}
