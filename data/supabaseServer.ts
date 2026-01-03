import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let adminClient: SupabaseClient | null = null;

export const getSupabaseAdminClient = (): SupabaseClient => {
  if (adminClient) return adminClient;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase admin client not configured. Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  }

  adminClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return adminClient;
};
