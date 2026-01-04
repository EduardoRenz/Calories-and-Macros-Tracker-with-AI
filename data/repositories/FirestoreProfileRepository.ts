import { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import { UserProfile } from '../../domain/entities/profile';
import { getDb } from '../firebase';
import { getAuth } from '../auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';
import { DataCacheManager } from '../infrastructure/DataCacheManager';

// This is the default profile structure for a new user.
const initialProfileData = {
    personalInfo: {
        age: 30,
        height: 170,
        weight: 70,
        gender: 'other' as 'female' | 'male' | 'other',
    },
    fitnessGoals: {
        primaryGoal: 'maintain' as 'lose' | 'maintain' | 'gain',
        targetWeight: 70,
        activityLevel: 'lightly' as 'sedentary' | 'lightly' | 'moderately' | 'very',
    },
    weightHistory: [],
};

export class FirestoreProfileRepository implements ProfileRepository {
    private auth = getAuth();
    private concurrencyManager = new ConcurrencyRequestManager();
    private dataCacheManager = new DataCacheManager();

    private getProfileDocRef() {
        const user = this.auth.currentUser;
        if (!user) {
            throw new Error("No authenticated user found for profile operations.");
        }
        return doc(getDb(), 'profiles', user.uid);
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

                return docSnap.data() as UserProfile;
            });
        });
    }

    async updateProfile(profile: UserProfile): Promise<void> {
        const currentProfile = await this.getProfile();

        const newWeight = profile.personalInfo.weight;
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;

        const updatedHistory = [...currentProfile.weightHistory];
        const entryForTodayIndex = updatedHistory.findIndex(entry => entry.date === today);

        if (entryForTodayIndex !== -1) {
            updatedHistory[entryForTodayIndex].weight = newWeight;
        } else {
            updatedHistory.push({ date: today, weight: newWeight });
        }

        updatedHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const profileToSave: UserProfile = { ...profile, weightHistory: updatedHistory };

        await setDoc(this.getProfileDocRef(), profileToSave);

        // Invalidate cache
        if (this.auth.currentUser) {
            this.dataCacheManager.invalidate(`profile:${this.auth.currentUser.uid}`);
        }
    }
}