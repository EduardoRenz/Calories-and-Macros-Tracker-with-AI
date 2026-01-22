import { PlansRepository } from '../../domain/repositories/PlansRepository';
import { Plan } from '../../domain/entities/payment';

export class FirestorePlansRepository implements PlansRepository {
    private static instance: FirestorePlansRepository | null = null;

    private constructor() { }

    static getInstance(): FirestorePlansRepository {
        if (!this.instance) {
            this.instance = new FirestorePlansRepository();
        }
        return this.instance;
    }

    async getPlans(language: string): Promise<Plan[]> {
        // TODO: Implementar busca no Firestore/Firebase
        // Por enquanto, delega para mock ou vazio
        console.warn('[FirestorePlansRepository] getPlans not implemented yet. Returning empty array.');
        return [];
    }
}
