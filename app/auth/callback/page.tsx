'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/data/supabaseClient';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const next = searchParams.get('next') ?? '/dashboard';

      if (code) {
        const supabase = getSupabaseClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
          router.push(next);
          return;
        }

        console.error('Auth callback error:', error);
      }

      // If no code or error, redirect to login
      router.push('/login?error=auth_failed');
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="bg-healthpal-dark min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-healthpal-green mx-auto mb-4"></div>
        <p className="text-healthpal-text-secondary">Autenticando...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="bg-healthpal-dark min-h-screen flex items-center justify-center">
        <p className="text-healthpal-text-secondary">Carregando...</p>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
