// Vitamin status indicators
export type VitaminStatus = 'good' | 'low' | 'deficient';

export interface VitaminAnalysis {
    name: string;
    status: VitaminStatus;
    emoji?: string;
    recommendations?: string[]; // For low/deficient vitamins, list of recommendations
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
    type?: 'reduce' | 'substitute'; // For exceeded macros: reduce (🚫) or substitute (🔄)
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
