export type DietType = 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'carnivore' | 'flexitarian';

export interface PersonalInfo {
    age: number | null;
    height: number | null;
    weight: number | null;
    gender: 'female' | 'male' | 'other' | null;
}

export interface FitnessGoals {
    primaryGoal: 'lose' | 'maintain' | 'gain' | null;
    targetWeight: number | null;
    activityLevel: 'sedentary' | 'lightly' | 'moderately' | 'very' | null;
}

export interface WeightEntry {
    date: string; // YYYY-MM-DD
    weight: number;
}

export type HealthConditionKey =
    | 'diabetes'
    | 'lactoseIntolerance'
    | 'glutenIntolerance'
    | 'celiacDisease'
    | 'hypertension'
    | 'highCholesterol'
    | 'kidneyDisease'
    | 'gout'
    | 'ibs'
    | 'gerd';

export interface HealthConditions {
    selected: HealthConditionKey[];
    notes?: string;
}

export interface UserProfile {
    name: string;
    email: string;
    personalInfo: PersonalInfo;
    fitnessGoals: FitnessGoals;
    weightHistory: WeightEntry[];
    healthConditions: HealthConditions;
    dietType?: DietType;
}

export function isProfileComplete(profile: UserProfile | null | undefined): boolean {
    if (!profile) return false;

    // Check if personalInfo exists
    if (!profile.personalInfo) return false;

    const personalInfoComplete =
        profile.personalInfo.age != null &&
        profile.personalInfo.age > 0 &&
        profile.personalInfo.height != null &&
        profile.personalInfo.height > 0 &&
        profile.personalInfo.weight != null &&
        profile.personalInfo.weight > 0 &&
        profile.personalInfo.gender != null;

    // Check if fitnessGoals exists
    if (!profile.fitnessGoals) return false;

    const fitnessGoalsComplete =
        profile.fitnessGoals.primaryGoal != null &&
        profile.fitnessGoals.targetWeight != null &&
        profile.fitnessGoals.targetWeight > 0 &&
        profile.fitnessGoals.activityLevel != null;

    return personalInfoComplete && fitnessGoalsComplete;
}