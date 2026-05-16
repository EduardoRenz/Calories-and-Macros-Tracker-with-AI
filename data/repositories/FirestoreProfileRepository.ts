import { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import { DietType, UserProfile } from '../../domain/entities/profile';
import { getDb } from '../firebase';
import { getAuth } from '../auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';
import { DataCacheManager } from '../infrastructure/DataCacheManager';

// This is the default profile structure for a new user (with null values for required fields).
const initialProfileData = {
    personalInfo: {
        age: null as number | null,
        height: null as number | null,
        weight: null as number | null,
        gender: null as 'female' | 'male' | 'other' | null,
    },
    fitnessGoals: {
        primaryGoal: null as 'lose' | 'maintain' | 'gain' | null,
        targetWeight: null as number | null,
        activityLevel: null as 'sedentary' | 'lightly' | 'moderately' | 'very' | null,
    },
    weightHistory: [],
    healthConditions: { selected: [] },
    dietType: 'omnivore' as DietType,
};

export class FirestoreProfileRepository implements ProfileRepository {
    private static instance: FirestoreProfileRepository;
    private auth = getAuth();
    private concurrencyManager = new ConcurrencyRequestManager();
    private dataCacheManager = new DataCacheManager();

    private constructor() { }

    public static getInstance(): FirestoreProfileRepository {
        if (!FirestoreProfileRepository.instance) {
            FirestoreProfileRepository.instance = new FirestoreProfileRepository();
        }
        return FirestoreProfileRepository.instance;
    }

    private getProfileDocRef() {
        const user = this.auth.currentUser;
        if (!user) {
            throw new Error("No authenticated user found for profile operations.");
        }
        return doc(getDb(), 'profiles', user.uid);
    }

    async getUserId(): Promise<string> {
        const user = this.auth.currentUser;
        if (!user) {
            throw new Error("No authenticated user found.");
        }
        return user.uid;
    }

    async getProfile(): Promise<UserProfile> {
        return this.concurrencyManager.run('getProfile', async () => {
            const user = this.auth.currentUser;
            if (!user) {
                throw new Error("User not authenticated. Cannot fetch profile.");
            }
            const key = `profile:${user.uid}`;
            return this.dataCacheManager.getCached(key, async () => {

                const docRef = this.getProfileDocRef();
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    const newProfile: UserProfile = {
                        ...initialProfileData,
                        name: user.displayName || "New User",
                        email: user.email || "",
                    };
                    await setDoc(this.getProfileDocRef(), newProfile);
                    return newProfile;
                }

                const loaded = docSnap.data() as UserProfile;
                return {
                    ...loaded,
                    personalInfo: {
                        age: loaded.personalInfo?.age ?? null,
                        height: loaded.personalInfo?.height ?? null,
                        weight: loaded.personalInfo?.weight ?? null,
                        gender: loaded.personalInfo?.gender ?? null,
                    },
                    fitnessGoals: {
                        primaryGoal: loaded.fitnessGoals?.primaryGoal ?? null,
                        targetWeight: loaded.fitnessGoals?.targetWeight ?? null,
                        activityLevel: loaded.fitnessGoals?.activityLevel ?? null,
                    },
                    healthConditions: loaded.healthConditions ?? { selected: [] },
                    dietType: loaded.dietType ?? 'omnivore',
                };
            });
        });
    }

    async updateProfile(profile: UserProfile): Promise<void> {
        const currentProfile = await this.getProfile();

        const newWeight = profile.personalInfo.weight;
        let updatedHistory = [...currentProfile.weightHistory];

        // Only update weight history if weight is provided
        if (newWeight !== null && newWeight > 0) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const today = `${year}-${month}-${day}`;

            const entryForTodayIndex = updatedHistory.findIndex(entry => entry.date === today);

            if (entryForTodayIndex !== -1) {
                updatedHistory[entryForTodayIndex] = {
                    ...updatedHistory[entryForTodayIndex],
                    weight: newWeight
                };
            } else {
                updatedHistory.push({ date: today, weight: newWeight });
            }

            updatedHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }

        const profileToSave: UserProfile = { ...profile, weightHistory: updatedHistory };

        await setDoc(this.getProfileDocRef(), profileToSave);

        // Invalidate cache
        if (this.auth.currentUser) {
            this.dataCacheManager.invalidate(`profile:${this.auth.currentUser.uid}`);
        }
    }
}