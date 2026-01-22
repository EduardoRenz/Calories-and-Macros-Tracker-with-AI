import { PlansRepository } from '../../domain/repositories/PlansRepository';
import { Plan } from '../../domain/entities/payment';

export class SupabasePlansRepository implements PlansRepository {
    private static instance: SupabasePlansRepository | null = null;

    private constructor() { }

    static getInstance(): SupabasePlansRepository {
        if (!this.instance) {
            this.instance = new SupabasePlansRepository();
        }
        return this.instance;
    }

    async getPlans(language: string): Promise<Plan[]> {
        // TODO: Implementar busca no Supabase
        // Por enquanto, delega para mock ou vazio
        console.warn('[SupabasePlansRepository] getPlans not implemented yet. Returning empty array.');
        return [];
    }
}
