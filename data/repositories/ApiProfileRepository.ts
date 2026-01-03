import { ProfileRepository } from '@/domain/repositories/ProfileRepository';
import { UserProfile } from '@/domain/entities/profile';
import { apiClient } from '@/lib/apiClient';

/**
 * ProfileRepository implementation that calls the server-side API.
 * All requests are authenticated via the Authorization header.
 */
export class ApiProfileRepository implements ProfileRepository {
    async getProfile(): Promise<UserProfile> {
        return apiClient.get<UserProfile>('/api/profile');
    }

    async updateProfile(profile: UserProfile): Promise<void> {
        await apiClient.put<{ success: boolean }>('/api/profile', profile);
    }
}
