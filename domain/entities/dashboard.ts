export interface Ingredient {
    id: string;
    name: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
}

export interface Meal {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    ingredients: Ingredient[];
}

export interface MealSummary {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks: Meal;
}

export interface Macro {
  current: number;
  goal: number;
}

export interface DashboardData {
  date: string; // YYYY-MM-DD
  macros: {
    calories: Macro;
    protein: Macro;
    carbs: Macro;
    fats: Macro;
  };
  meals: MealSummary;
}