export interface DailyHistoryEntry {
  date: string; // YYYY-MM-DD
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
  calorieGoal: number;
  hasEntry: boolean;
}
