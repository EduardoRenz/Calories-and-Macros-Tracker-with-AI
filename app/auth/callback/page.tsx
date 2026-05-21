'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/data/supabaseClient';
import { isValidRedirect } from '@/utils/security';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Use sessionStorage to persist state across Strict Mode remounts
    const processingKey = 'auth_callback_processing';
    if (sessionStorage.getItem(processingKey) === 'true') {
      return;
    }
    sessionStorage.setItem(processingKey, 'true');

    const handleCallback = async () => {
      const code = searchParams.get('code');
      let next = searchParams.get('next') ?? '/dashboard';

      // Security check to prevent Open Redirect vulnerabilities
      if (!isValidRedirect(next)) {
        console.warn('[AuthCallback] Invalid redirect target detected, falling back to dashboard:', next);
        next = '/dashboard';
      }

      const supabase = getSupabaseClient();

      // First, check if a session already exists (implicit flow)
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session) {
        sessionStorage.removeItem(processingKey);
        router.push(next);
        return;
      }

      // If no session but code exists, try PKCE flow
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
          sessionStorage.removeItem(processingKey);
          router.push(next);
          return;
        }

        console.error('Auth callback error:', error);
      }

      // If no code or error, redirect to login
      sessionStorage.removeItem(processingKey);
      router.push('/login?error=auth_failed');
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="bg-neutral-dark min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-green mx-auto mb-4"></div>
        <p className="text-neutral-text-secondary">Autenticando...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="bg-neutral-dark min-h-screen flex items-center justify-center">
        <p className="text-neutral-text-secondary">Carregando...</p>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
