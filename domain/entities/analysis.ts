// Vitamin status indicators
export type VitaminStatus = 'good' | 'low' | 'deficient';

export interface VitaminAnalysis {
    name: string;
    status: VitaminStatus;
}

export interface MealFoods {
    foods: string[];
    consistency: number;
}

export interface CommonFoods {
    breakfast: MealFoods;
    lunch: MealFoods;
    dinner: MealFoods;
    snacks: MealFoods;
}

export interface AttentionPoint {
    severity: 'warning' | 'alert';
    title: string;
    description: string;
}

export interface FoodSuggestion {
    meal: string;
    food: string;
    benefit: string;
}

export interface MacroSuggestion {
    macro: string;
    current: number;
    goal: number;
    recommendations: FoodSuggestion[];
}

export interface FoodAnalysisReport {
    generatedAt: string;
    dateRange: { start: string; end: string };
    commonFoods: CommonFoods;
    vitamins: VitaminAnalysis[];
    attentionPoints: AttentionPoint[];
    macroSuggestions: MacroSuggestion[];
}

// Cache structure for localStorage
export interface CachedFoodAnalysisReport {
    report: FoodAnalysisReport;
    cachedAt: number;
    dateRange: { start: string; end: string };
}
