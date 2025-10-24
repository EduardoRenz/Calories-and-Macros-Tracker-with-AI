

import type { DashboardData } from './domain/entities/dashboard';

export const initialData: DashboardData = {
  date: "2023-10-26",
  macros: {
    calories: { current: 1500, goal: 2200 },
    protein: { current: 80, goal: 120 },
    carbs: { current: 180, goal: 250 },
    fats: { current: 50, goal: 70 },
  },
  meals: {
    breakfast: { name: "Breakfast", calories: 450, protein: 30, carbs: 50, fats: 15, ingredients: [] },
    lunch: { name: "Lunch", calories: 600, protein: 40, carbs: 70, fats: 20, ingredients: [] },
    dinner: { name: "Dinner", calories: 450, protein: 10, carbs: 60, fats: 15, ingredients: [] },
    snacks: { name: "Snacks", calories: 0, protein: 0, carbs: 0, fats: 0, ingredients: [] },
  },
};
