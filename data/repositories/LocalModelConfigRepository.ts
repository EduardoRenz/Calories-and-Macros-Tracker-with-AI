import { ModelConfigRepository } from '../../domain/repositories/ModelConfigRepository';
import { DEFAULT_MODEL_CONFIG } from '../config/DefaultModelConfig';

export class LocalModelConfigRepository implements ModelConfigRepository {
    static instance: LocalModelConfigRepository;
    private config: Record<string, Record<string, string>> = {};

    private constructor() {
        // Default local configuration
        this.config = { ...DEFAULT_MODEL_CONFIG };
    }

    public static getInstance(): LocalModelConfigRepository {
        if (!LocalModelConfigRepository.instance) {
            LocalModelConfigRepository.instance = new LocalModelConfigRepository();
        }
        return LocalModelConfigRepository.instance;
    }

    async getModelVersion(provider: string, service: string): Promise<string> {
        return this.config[provider]?.[service] || 'unknown-model';
    }

    async getAllModelVersions(): Promise<Record<string, Record<string, string>>> {
        return { ...this.config };
    }

    // Methods for testing/local configuration updates
    updateModelVersion(provider: string, service: string, version: string): void {
        if (!this.config[provider]) {
            this.config[provider] = {};
        }
        this.config[provider][service] = version;
    }

    updateAllConfig(newConfig: Record<string, Record<string, string>>): void {
        this.config = { ...newConfig };
    }

    reset(): void {
        this.config = { ...DEFAULT_MODEL_CONFIG };
    }
}
