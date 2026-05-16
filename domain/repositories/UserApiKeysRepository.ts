import { ProviderId } from "../../hooks/useApiKeys";

export interface UserApiKey {
    provider: ProviderId;
    key: string;
    addedAt: number;
}

export interface UserApiKeysRepository {
    getApiKeys(): UserApiKey[];
    hasApiKeys(): boolean;
}
