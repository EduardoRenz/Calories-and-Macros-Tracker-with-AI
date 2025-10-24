
export interface Macro {
  current: number;
  goal: number;
}

export interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface MealSummary {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks: Meal;
}

export interface DashboardData {
  date: string;
  macros: {
    calories: Macro;
    protein: Macro;
    carbs: Macro;
    fats: Macro;
  };
  meals: MealSummary;
}
