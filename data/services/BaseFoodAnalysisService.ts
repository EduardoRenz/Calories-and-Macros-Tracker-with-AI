import { FoodAnalysisReport, VitaminStatus } from '../../domain/entities/analysis';
import { FoodAnalysisInput, FoodAnalysisService } from '../../domain/services/FoodAnalysisService';
import { DashboardData, Ingredient } from '../../domain/entities/dashboard';

export abstract class BaseFoodAnalysisService implements FoodAnalysisService {

    abstract generateAnalysis(input: FoodAnalysisInput): Promise<FoodAnalysisReport>;

    protected consolidateMealData(dashboardData: DashboardData[]): string {
        const allMeals = {
            breakfast: [] as string[],
            lunch: [] as string[],
            dinner: [] as string[],
            snacks: [] as string[]
        };

        for (const day of dashboardData) {
            for (const [mealType, meal] of Object.entries(day.meals)) {
                const ingredients = meal.ingredients.map((ing: Ingredient) => `${ing.name} (${ing.quantity})`);
                allMeals[mealType as keyof typeof allMeals].push(...ingredients);
            }
        }

        return Object.entries(allMeals)
            .map(([meal, foods]) => `${meal}: ${foods.length > 0 ? foods.join(', ') : 'No data'}`)
            .join('\n');
    }

    protected getMacroGoals(dashboardData: DashboardData[]): { calories: number; protein: number; carbs: number; fats: number } {
        if (dashboardData.length === 0) {
            return { calories: 2000, protein: 140, carbs: 250, fats: 65 };
        }

        const recentDay = dashboardData[dashboardData.length - 1];
        return {
            calories: recentDay.macros.calories.goal,
            protein: recentDay.macros.protein.goal,
            carbs: recentDay.macros.carbs.goal,
            fats: recentDay.macros.fats.goal
        };
    }

    protected calculateMacroAverages(dashboardData: DashboardData[]): { calories: number; protein: number; carbs: number; fats: number } {
        const activeDays = dashboardData.filter(day => day.macros.calories.current > 0);

        if (activeDays.length === 0) {
            return { calories: 0, protein: 0, carbs: 0, fats: 0 };
        }

        const totals = activeDays.reduce((acc, day: DashboardData) => {
            return {
                calories: acc.calories + day.macros.calories.current,
                protein: acc.protein + day.macros.protein.current,
                carbs: acc.carbs + day.macros.carbs.current,
                fats: acc.fats + day.macros.fats.current
            };
        }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

        const numDays = activeDays.length;
        return {
            calories: totals.calories / numDays,
            protein: totals.protein / numDays,
            carbs: totals.carbs / numDays,
            fats: totals.fats / numDays
        };
    }

    protected getDateRange(dashboardData: DashboardData[]): { start: string; end: string } {
        if (dashboardData.length === 0) {
            const today = new Date().toISOString().split('T')[0];
            return { start: today, end: today };
        }

        const dates = dashboardData.map((d: DashboardData) => d.date).sort();
        return {
            start: dates[0],
            end: dates[dates.length - 1]
        };
    }

    protected buildPrompt(input: FoodAnalysisInput): string {
        const { dashboardData, profile, language } = input;

        const languageMap: { [key: string]: string } = {
            'en': 'English',
            'es': 'Spanish',
            'pt': 'Portuguese'
        };
        const languageName = languageMap[language] || 'English';

        const mealSummary = this.consolidateMealData(dashboardData);
        const dateRange = this.getDateRange(dashboardData);
        const macroAverages = this.calculateMacroAverages(dashboardData);
        const macroGoals = this.getMacroGoals(dashboardData);

        return `You are a nutrition expert AI assistant. Analyze the following meal data and provide a comprehensive nutrition report.

User Profile:
- Age: ${profile.personalInfo.age}
- Gender: ${profile.personalInfo.gender}
- Weight: ${profile.personalInfo.weight} kg
- Height: ${profile.personalInfo.height} cm
- Goal: ${profile.fitnessGoals.primaryGoal}
- Activity Level: ${profile.fitnessGoals.activityLevel}

User's Daily Macro Goals:
- Calories: ${macroGoals.calories} kcal
- Protein: ${macroGoals.protein}g
- Carbs: ${macroGoals.carbs}g
- Fats: ${macroGoals.fats}g

User's Daily Macro Averages (period ${dateRange.start} to ${dateRange.end}):
- Calories: ${macroAverages.calories.toFixed(0)} kcal (average per day)
- Protein: ${macroAverages.protein.toFixed(1)}g (average per day)
- Carbs: ${macroAverages.carbs.toFixed(1)}g (average per day)
- Fats: ${macroAverages.fats.toFixed(1)}g (average per day)

Meal Data for the period:
${mealSummary}

Please respond in ${languageName} with:
1. Most common foods for each meal (breakfast, lunch, dinner, snacks) with consistency percentage
2. Vitamin status analysis (A, C, D, Iron, Calcium, B12) - rate as 'good', 'low', or 'deficient'
3. Attention points - areas needing improvement
4. Macro suggestions with specific food recommendations
   IMPORTANT: For macro suggestions, use the CURRENT AVERAGES and USER'S GOALS provided above.
   - For macros BELOW goal: suggest foods to ADD (current < goal)
   - For macros ABOVE goal: suggest foods to REDUCE or SUBSTITUTE (current > goal)
   - The 'current' field MUST be the daily average (${macroAverages.calories.toFixed(0)}, ${macroAverages.protein.toFixed(1)}, ${macroAverages.carbs.toFixed(1)}, ${macroAverages.fats.toFixed(1)})
   - The 'goal' field MUST be the user's daily goal (${macroGoals.calories}, ${macroGoals.protein}, ${macroGoals.carbs}, ${macroGoals.fats})
   - Use these EXACT numbers in your response

Respond ONLY with a valid JSON object (no markdown formatting, no code blocks) matching the following schema:
{
    "commonFoods": {
        "breakfast": { "foods": ["string"], "consistency": number },
        "lunch": { "foods": ["string"], "consistency": number },
        "dinner": { "foods": ["string"], "consistency": number },
        "snacks": { "foods": ["string"], "consistency": number }
    },
    "vitamins": [
        { "name": "string", "status": "good" | "low" | "deficient" }
    ],
    "attentionPoints": [
        { "severity": "warning" | "alert", "title": "string", "description": "string" }
    ],
    "macroSuggestions": [
        {
            "macro": "string",
            "current": number,
            "goal": number,
            "recommendations": [
                { "meal": "string", "food": "string", "benefit": "string" }
            ]
        }
    ]
}`;
    }
}
