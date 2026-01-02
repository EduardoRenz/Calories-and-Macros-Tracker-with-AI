import { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import { UserProfile } from '../../domain/entities/profile';
import { getSupabaseClient } from '../supabaseClient';

type ProfilesRow = {
  user_id: string;
  name: string | null;
  email: string | null;
  age: number;
  height: number;
  weight: number;
  gender: 'female' | 'male' | 'other';
  primary_goal: 'lose' | 'maintain' | 'gain';
  target_weight: number;
  activity_level: 'sedentary' | 'lightly' | 'moderately' | 'very';
};

type WeightHistoryRow = {
  date: string;
  weight: number;
};

export class SupabaseProfileRepository implements ProfileRepository {
  private async getUserId(): Promise<string> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!data.user) throw new Error('User not authenticated. Cannot fetch profile.');
    return data.user.id;
  }

  private mapToDomain(profile: ProfilesRow, weightHistory: WeightHistoryRow[]): UserProfile {
    return {
      name: profile.name ?? 'New User',
      email: profile.email ?? '',
      personalInfo: {
        age: profile.age,
        height: profile.height,
        weight: Number(profile.weight),
        gender: profile.gender,
      },
      fitnessGoals: {
        primaryGoal: profile.primary_goal,
        targetWeight: Number(profile.target_weight),
        activityLevel: profile.activity_level,
      },
      weightHistory: weightHistory
        .map(w => ({ date: w.date, weight: Number(w.weight) }))
        .sort((a, b) => (a.date < b.date ? -1 : 1)),
    };
  }

  async getProfile(): Promise<UserProfile> {
    const supabase = getSupabaseClient();
    const userId = await this.getUserId();

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
        age: 30,
        height: 170,
        weight: 70,
        gender: 'other',
        primary_goal: 'maintain',
        target_weight: 70,
        activity_level: 'lightly',
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
        },
        { onConflict: 'user_id' }
      );

    if (upError) throw upError;

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
}
