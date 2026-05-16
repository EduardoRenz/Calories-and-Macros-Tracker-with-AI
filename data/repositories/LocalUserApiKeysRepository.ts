import { UserApiKeysRepository, UserApiKey } from "../../domain/repositories/UserApiKeysRepository";

export class LocalUserApiKeysRepository implements UserApiKeysRepository {
    private static instance: LocalUserApiKeysRepository;
    private readonly STORAGE_KEY = 'ai_api_keys';

    private constructor() {}

    public static getInstance(): LocalUserApiKeysRepository {
        if (!LocalUserApiKeysRepository.instance) {
            LocalUserApiKeysRepository.instance = new LocalUserApiKeysRepository();
        }
        return LocalUserApiKeysRepository.instance;
    }

    getApiKeys(): UserApiKey[] {
        if (typeof window === 'undefined') return [];
        const item = localStorage.getItem(this.STORAGE_KEY);
        if (!item) return [];
        try {
            return JSON.parse(item) as UserApiKey[];
        } catch {
            return [];
        }
    }

    hasApiKeys(): boolean {
        return this.getApiKeys().length > 0;
    }
}
