// Vitamin status indicators
export type VitaminStatus = 'good' | 'low' | 'deficient';

export interface VitaminAnalysis {
    name: string;
    status: VitaminStatus;
    emoji?: string;
    recommendations?: string[]; // For low/deficient vitamins, list of recommendations
    positiveReason?: string; // For good/low vitamins, explain why user is doing well/acceptable
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

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export type MacroType = 'protein' | 'carbs' | 'fats' | 'fiber' | 'other';

export interface FoodSuggestion {
    meal: string;
    mealType?: MealType; // Structured meal enum consumed by the UI
    food: string;
    benefit: string;
    type?: 'reduce' | 'substitute'; // For exceeded macros: reduce (🚫) or substitute (🔄)
}

export interface MacroSuggestion {
    macro: string;
    macroType?: MacroType; // Structured macro enum consumed by the UI
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
