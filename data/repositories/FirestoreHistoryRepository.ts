import { collection, getDocs, limit, orderBy, query, startAfter, startAt, endAt, documentId, QueryConstraint } from 'firebase/firestore';

import { HistoryRepository } from '../../domain/repositories/HistoryRepository';
import { DailyHistoryEntry } from '../../domain/entities/history';
import { HistoryPage } from '../../domain/repositories/HistoryRepository';
import { getDb } from '../firebase';
import { getAuth } from '../auth';
import { DashboardData, MealSummary } from '../../domain/entities/dashboard';
import { CalorieCalculationService } from '../../domain/services/CalorieCalculationService';
import { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import { FirestoreProfileRepository } from './FirestoreProfileRepository';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';

// Helper function to check if any meal has ingredients
const hasAnyIngredients = (meals?: MealSummary): boolean => {
  if (!meals) return false;
  return Object.values(meals).some(meal => (meal?.ingredients?.length ?? 0) > 0);
};

// Helper function to calculate total fiber from meals
const calculateTotalFiber = (meals?: MealSummary): number => {
  if (!meals) return 0;
  return Object.values(meals).reduce((total: number, meal) => {
    return total + meal.ingredients.reduce((mealTotal: number, ingredient: any) => {
      return mealTotal + (ingredient.fiber || 0);
    }, 0);
  }, 0);
};

export class FirestoreHistoryRepository implements HistoryRepository {
  private auth = getAuth();
  private profileRepository: ProfileRepository = new FirestoreProfileRepository();
  private concurrencyManager = new ConcurrencyRequestManager();

  async getDailyHistoryRange(params: { startDate: string; endDate: string }): Promise<DailyHistoryEntry[]> {
    const key = `getDailyHistoryRange:${params.startDate}:${params.endDate}`;
    return this.concurrencyManager.run(key, async () => {
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found for history operations.');
      }

      const { startDate, endDate } = params;

      const colRef = collection(getDb(), 'users', user.uid, 'dashboard_data');
      const q = query(
        colRef,
        orderBy(documentId(), 'desc'),
        startAt(endDate),
        endAt(startDate)
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
          const fiber = calculateTotalFiber(data?.meals);

          const hasEntry = hasAnyIngredients(data?.meals);

          return {
            date: data?.date ?? d.id,
            protein,
            carbs,
            fats,
            fiber,
            calories,
            calorieGoal,
            hasEntry,
          };
        })
        .sort((a, b) => (a.date < b.date ? 1 : -1));

      return entries;
    });
  }

  async getDailyHistoryPage(params: { startDate: string; endDate: string; pageSize: number; cursor?: string | null; }): Promise<HistoryPage> {
    const key = `getDailyHistoryPage:${params.startDate}:${params.endDate}:${params.pageSize}:${params.cursor}`;
    return this.concurrencyManager.run(key, async () => {
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found for history operations.');
      }

      const { startDate, endDate, pageSize, cursor } = params;

      const colRef = collection(getDb(), 'users', user.uid, 'dashboard_data');

      const constraints: QueryConstraint[] = [
        orderBy(documentId(), 'desc'),
        startAt(endDate),
        endAt(startDate),
      ];

      if (cursor) {
        constraints.push(startAfter(cursor));
      }

      constraints.push(limit(pageSize));

      const q = query(colRef, ...constraints);
      const snap = await getDocs(q);

      const profile = await this.profileRepository.getProfile();
      const goals = CalorieCalculationService.calculateGoals(profile);

      const items: DailyHistoryEntry[] = snap.docs.map(d => {
        const data = d.data() as DashboardData;
        const calories = data?.macros?.calories?.current ?? 0;
        const calorieGoal = data?.macros?.calories?.goal ?? goals.calories;
        const protein = data?.macros?.protein?.current ?? 0;
        const carbs = data?.macros?.carbs?.current ?? 0;
        const fats = data?.macros?.fats?.current ?? 0;
        const fiber = calculateTotalFiber(data?.meals);

        const hasEntry = hasAnyIngredients(data?.meals);

        return {
          date: data?.date ?? d.id,
          protein,
          carbs,
          fats,
          fiber,
          calories,
          calorieGoal,
          hasEntry,
        };
      });

      const nextCursor = snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1]?.id ?? null : null;

      return { items, nextCursor };
    });
  }
}
