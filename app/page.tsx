'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LandingPageContent } from '@/components/landing/LandingPageContent';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div data-testid="landing-page">
        <LandingPageContent />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div data-testid="landing-page">
      <LandingPageContent />
    </div>
  );
}
