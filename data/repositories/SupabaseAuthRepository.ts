import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { User } from '../../domain/entities/user';
import { getSupabaseClient } from '../supabaseClient';
import type { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { ConcurrencyRequestManager } from '../infrastructure/ConcurrencyRequestManager';

export class SupabaseAuthRepository implements AuthRepository {
  private concurrencyManager = new ConcurrencyRequestManager();
  private mapUser(u: SupabaseUser): User {
    return {
      uid: u.id,
      email: u.email ?? null,
      displayName: (u.user_metadata?.full_name ?? u.user_metadata?.name ?? null) as string | null,
      photoURL: (u.user_metadata?.avatar_url ?? null) as string | null,
    };
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      callback(data.session?.user ? this.mapUser(data.session.user) : null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      callback(session?.user ? this.mapUser(session.user) : null);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }

  async signIn(email: string, password?: string): Promise<User | null> {
    const key = `signIn:${email}:${password ? 'with-password' : 'otp'}`;
    return this.concurrencyManager.run(key, async () => {
      const supabase = getSupabaseClient();

      if (password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data.user ? this.mapUser(data.user) : null;
      }

      const { data, error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      return data.user ? this.mapUser(data.user) : null;
    });
  }

  async signInWithGoogle(): Promise<User | null> {
    const key = 'signInWithGoogle';
    return this.concurrencyManager.run(key, async () => {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
        },
      });

      console.log('signInWithOAuth', data, error);

      if (error) throw error;

      if (data.url && typeof window !== 'undefined') {
        window.location.assign(data.url);
      }

      return null;
    });
  }

  async signOut(): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getIdToken(): Promise<string | null> {
    const key = 'getIdToken';
    return this.concurrencyManager.run(key, async () => {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    });
  }
}
