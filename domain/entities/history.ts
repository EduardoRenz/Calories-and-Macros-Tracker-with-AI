export interface DailyHistoryEntry {
  date: string; // YYYY-MM-DD
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  calories: number;
  calorieGoal: number;
  hasEntry: boolean;
}
