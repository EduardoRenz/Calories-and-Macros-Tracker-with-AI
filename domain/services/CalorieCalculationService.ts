import { UserProfile } from '../entities/profile';

type ActivityLevel = 'sedentary' | 'lightly' | 'moderately' | 'very';
type PrimaryGoal = 'lose' | 'maintain' | 'gain';

const activityFactors: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    lightly: 1.375,
    moderately: 1.55,
    very: 1.725,
};

// Protein in g/kg — based on evidence-based guidelines:
// - Maintenance/Health: 0.8–1.2 g/kg (scaled by activity)
// - Weight Loss (preserve muscle): 1.2–2.0 g/kg
// - Muscle Gain (hypertrophy): 1.4–2.0 g/kg
const proteinMultipliers: Record<PrimaryGoal, Record<ActivityLevel, number>> = {
    maintain: { sedentary: 0.8, lightly: 1.0, moderately: 1.2, very: 1.4 },
    lose: { sedentary: 1.2, lightly: 1.5, moderately: 1.8, very: 2.0 },
    gain: { sedentary: 1.4, lightly: 1.6, moderately: 1.8, very: 2.0 },
};

// Fat in g/kg — essential for hormonal regulation and vitamin absorption:
// - Maintenance: 1.0 g/kg
// - Weight Loss: 0.8 g/kg (slightly lower to allow more protein/carbs)
// - Muscle Gain: 0.8 g/kg
const fatMultipliers: Record<PrimaryGoal, number> = {
    maintain: 1.0,
    lose: 0.8,
    gain: 0.8,
};

const CALORIES_PER_GRAM_PROTEIN = 4;
const CALORIES_PER_GRAM_CARB = 4;
const CALORIES_PER_GRAM_FAT = 9;

const CALORIE_ADJUSTMENT: Record<PrimaryGoal, number> = {
    lose: -500,
    maintain: 0,
    gain: 500,
};

export class CalorieCalculationService {
    public static calculateGoals(profile: UserProfile): { calories: number; protein: number; carbs: number; fats: number } | null {
        const { personalInfo, fitnessGoals } = profile;
        const { weight, height, age, gender } = personalInfo;
        const { activityLevel, primaryGoal } = fitnessGoals;

        // Return null if any required field is missing
        if (
            weight === null ||
            height === null ||
            age === null ||
            gender === null ||
            activityLevel === null ||
            primaryGoal === null
        ) {
            return null;
        }

        let bmr: number;
        if (gender === 'male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else { // 'female' or 'other', default to female equation for BMR calculation
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }

        const tdee = bmr * activityFactors[activityLevel];
        const calorieGoal = tdee + CALORIE_ADJUSTMENT[primaryGoal];

        const proteinGoal = Math.round(weight * proteinMultipliers[primaryGoal][activityLevel]);
        const fatsGoal = Math.round(weight * fatMultipliers[primaryGoal]);

        const proteinCalories = proteinGoal * CALORIES_PER_GRAM_PROTEIN;
        const fatsCalories = fatsGoal * CALORIES_PER_GRAM_FAT;
        const remainingCalories = calorieGoal - proteinCalories - fatsCalories;
        const carbsGoal = Math.round(remainingCalories / CALORIES_PER_GRAM_CARB);

        return {
            calories: Math.round(calorieGoal),
            protein: proteinGoal,
            carbs: carbsGoal,
            fats: fatsGoal,
        };
    }
}
