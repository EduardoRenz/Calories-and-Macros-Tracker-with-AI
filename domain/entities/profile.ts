export interface PersonalInfo {
    age: number;
    height: number;
    weight: number;
    gender: 'female' | 'male' | 'other';
}

export interface FitnessGoals {
    primaryGoal: 'lose' | 'maintain' | 'gain';
    targetWeight: number;
    activityLevel: 'sedentary' | 'lightly' | 'moderately' | 'very';
}

export interface WeightEntry {
    date: string; // YYYY-MM-DD
    weight: number;
}

export interface UserProfile {
    name: string;
    email: string;
    personalInfo: PersonalInfo;
    fitnessGoals: FitnessGoals;
    weightHistory: WeightEntry[];
}