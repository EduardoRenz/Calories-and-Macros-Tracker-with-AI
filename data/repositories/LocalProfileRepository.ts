
import { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import { UserProfile, WeightEntry } from '../../domain/entities/profile';

const initialProfile: UserProfile = {
    name: "Jane Doe",
    email: "janedoe@email.com",
    personalInfo: {
        age: 28,
        height: 165,
        weight: 62,
        gender: 'female',
    },
    fitnessGoals: {
        primaryGoal: 'lose',
        targetWeight: 58,
        activityLevel: 'lightly',
    },
    weightHistory: [
        { date: "2023-10-01", weight: 65 },
        { date: "2023-10-08", weight: 64.5 },
        { date: "2023-10-15", weight: 63 },
        { date: "2023-10-22", weight: 62.5 },
    ]
};

// Simulate a local data store
let userProfileData: UserProfile = JSON.parse(JSON.stringify(initialProfile));

export class LocalProfileRepository implements ProfileRepository {
    async getProfile(): Promise<UserProfile> {
        // Simulate an async API call
        await new Promise(resolve => setTimeout(resolve, 250));
        return JSON.parse(JSON.stringify(userProfileData));
    }

    async updateProfile(profile: UserProfile): Promise<void> {
        // Simulate an async API call
        await new Promise(resolve => setTimeout(resolve, 250));
        
        const newWeight = profile.personalInfo.weight;
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;

        // Use a mutable copy of the stored history
        const updatedHistory = [...userProfileData.weightHistory];
        const entryForTodayIndex = updatedHistory.findIndex(entry => entry.date === today);

        if (entryForTodayIndex !== -1) {
            // Update existing entry for today
            updatedHistory[entryForTodayIndex].weight = newWeight;
        } else {
            // Add new entry for today
            updatedHistory.push({ date: today, weight: newWeight });
        }
        
        // Ensure history is sorted by date before saving
        updatedHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        userProfileData = { ...profile, weightHistory: updatedHistory };
        return;
    }
}