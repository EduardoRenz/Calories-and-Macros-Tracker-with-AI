import { UserProfile } from '../entities/profile';

const activityFactors = {
    sedentary: 1.2,
    lightly: 1.375,
    moderately: 1.55,
    very: 1.725,
};

export class CalorieCalculationService {
    public static calculateGoals(profile: UserProfile) {
        const { personalInfo, fitnessGoals } = profile;
        const { weight, height, age, gender } = personalInfo;
        const { activityLevel, primaryGoal } = fitnessGoals;

        let bmr: number;
        if (gender === 'male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else { // 'female' or 'other', default to female equation for BMR calculation
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }

        const tdee = bmr * activityFactors[activityLevel];
        
        let calorieGoal = tdee;
        if (primaryGoal === 'lose') {
            calorieGoal -= 500;
        } else if (primaryGoal === 'gain') {
            calorieGoal += 500;
        }

        // Standard macro split: 40% Carbs, 30% Protein, 30% Fats
        const proteinGoal = Math.round((calorieGoal * 0.30) / 4);
        const carbsGoal = Math.round((calorieGoal * 0.40) / 4);
        const fatsGoal = Math.round((calorieGoal * 0.30) / 9);

        return {
            calories: Math.round(calorieGoal),
            protein: proteinGoal,
            carbs: carbsGoal,
            fats: fatsGoal,
        };
    }
}
