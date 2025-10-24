import { UserProfile } from '../entities/profile';

export interface ProfileRepository {
    getProfile(): Promise<UserProfile>;
    updateProfile(profile: UserProfile): Promise<void>;
}
