export interface ModelConfigRepository {
    getModelVersion(provider: string, service: string): Promise<string>;
    getAllModelVersions(): Promise<Record<string, Record<string, string>>>;
}
