import { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import { DietType, HealthConditionKey, HealthConditions, UserProfile } from '../../domain/entities/profile';
import { getSupabaseClient } from '../supabaseClient';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';
import { DataCacheManager } from '../infrastructure/DataCacheManager';

type ProfilesRow = {
  user_id: string;
  name: string | null;
  email: string | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  gender: 'female' | 'male' | 'other' | null;
  primary_goal: 'lose' | 'maintain' | 'gain' | null;
  target_weight: number | null;
  activity_level: 'sedentary' | 'lightly' | 'moderately' | 'very' | null;
  health_conditions: string[] | null;
  diet_type: DietType | null;
};

type WeightHistoryRow = {
  date: string;
  weight: number;
};

export class SupabaseProfileRepository implements ProfileRepository {
  private static instance: SupabaseProfileRepository;
  private concurrencyManager: ConcurrencyRequestManager = new ConcurrencyRequestManager();
  private dataCacheManager: DataCacheManager = new DataCacheManager();

  private constructor() { }

  public static getInstance(): SupabaseProfileRepository {
    if (!SupabaseProfileRepository.instance) {
      SupabaseProfileRepository.instance = new SupabaseProfileRepository();
    }
    return SupabaseProfileRepository.instance;
  }
  private userId: string | undefined;

  private getDefaultHealthConditions(): string[] {
    return [];
  }

  async getUserId(): Promise<string> {
    if (this.userId) return this.userId;
    return this.concurrencyManager.run('GET_USER_ID_LOCK', async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!data.user) throw new Error('User not authenticated. Cannot fetch profile.');
      this.userId = data.user.id;
      return data.user.id;
    });
  }

  private mapToDomain(profile: ProfilesRow, weightHistory: WeightHistoryRow[]): UserProfile {
    return {
      name: profile.name ?? 'New User',
      email: profile.email ?? '',
      personalInfo: {
        age: profile.age ?? null,
        height: profile.height ?? null,
        weight: profile.weight !== null ? Number(profile.weight) : null,
        gender: profile.gender ?? null,
      },
      fitnessGoals: {
        primaryGoal: profile.primary_goal ?? null,
        targetWeight: profile.target_weight !== null ? Number(profile.target_weight) : null,
        activityLevel: profile.activity_level ?? null,
      },
      weightHistory: weightHistory
        .map(w => ({ date: w.date, weight: Number(w.weight) }))
        .sort((a, b) => (a.date < b.date ? -1 : 1)),
      healthConditions: { selected: (profile.health_conditions ?? []) as HealthConditionKey[] },
      dietType: profile.diet_type ?? 'omnivore',
    };
  }

  async getProfile(): Promise<UserProfile> {
    // We need userId for the cache key to be safe across users (if implementation is shared)
    // However, fetching userId might also be an async op we want to cache? 
    // Usually auth getUser is fast/cached by client, but let's be safe.
    // For now, we'll fetch userId first (deduplicated).
    const userId = await this.getUserId();
    const key = `profile:${userId}`;

    return this.dataCacheManager.getCached(key, async () => {
      return this.concurrencyManager.run(key, async () => {
        const supabase = getSupabaseClient();
        // We already have userId

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) throw error;

        if (!profile) {
          const { data: authData, error: authError } = await supabase.auth.getUser();
          if (authError) throw authError;
          const user = authData.user;
          if (!user) throw new Error('User not authenticated. Cannot create profile.');

          const insert: Partial<ProfilesRow> = {
            user_id: userId,
            name: (user.user_metadata?.full_name ?? user.user_metadata?.name ?? 'New User') as string,
            email: user.email ?? '',
            age: null,
            height: null,
            weight: null,
            gender: null,
            primary_goal: null,
            target_weight: null,
            activity_level: null,
            health_conditions: this.getDefaultHealthConditions(),
            diet_type: 'omnivore',
          };

          const { data: created, error: createError } = await supabase
            .from('profiles')
            .insert(insert)
            .select('*')
            .single();

          if (createError) throw createError;

          return this.mapToDomain(created as ProfilesRow, []);
        }

        const { data: weights, error: weightsError } = await supabase
          .from('weight_history')
          .select('date,weight')
          .eq('user_id', userId)
          .order('date', { ascending: true });

        if (weightsError) throw weightsError;

        return this.mapToDomain(profile as ProfilesRow, (weights ?? []) as WeightHistoryRow[]);
      });
    });
  }

  async updateProfile(profile: UserProfile): Promise<void> {
    const supabase = getSupabaseClient();
    const userId = await this.getUserId();

    const { error: upError } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: userId,
          name: profile.name,
          email: profile.email,
          age: profile.personalInfo.age,
          height: profile.personalInfo.height,
          weight: profile.personalInfo.weight,
          gender: profile.personalInfo.gender,
          primary_goal: profile.fitnessGoals.primaryGoal,
          target_weight: profile.fitnessGoals.targetWeight,
          activity_level: profile.fitnessGoals.activityLevel,
          health_conditions: profile.healthConditions?.selected ?? [],
          diet_type: profile.dietType ?? 'omnivore',
        },
        { onConflict: 'user_id' }
      );

    if (upError) throw upError;

    // Only update weight history if weight is provided
    if (profile.personalInfo.weight !== null && profile.personalInfo.weight > 0) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;

      const { error: whError } = await supabase
        .from('weight_history')
        .upsert({ user_id: userId, date: today, weight: profile.personalInfo.weight }, { onConflict: 'user_id,date' });

      if (whError) throw whError;
    }

    // Invalidate cache
    this.dataCacheManager.invalidate(`profile:${userId}`);
  }
}
