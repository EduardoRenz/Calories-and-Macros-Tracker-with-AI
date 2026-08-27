'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { LandingNavbar } from './LandingNavbar';
import { LandingHero } from './LandingHero';
import { LandingKeyStats } from './LandingKeyStats';
import { LandingAIFeatures } from './LandingAIFeatures';
import { LandingClinicalFocus } from './LandingClinicalFocus';
import { LandingVisualDemo } from './LandingVisualDemo';
import { LandingPricing } from './LandingPricing';
import { LandingFAQ } from './LandingFAQ';
import { LandingCTA } from './LandingCTA';
import { LandingFooter } from './LandingFooter';

export const LandingPageContent: React.FC = () => {
  const { user, loading } = useAuth();
  const isAuthenticated = !loading && !!user;
  const { t } = useTranslation();

  return (
    <main className="scroll-smooth overflow-hidden">
      <LandingNavbar isAuthenticated={isAuthenticated} />
      <LandingHero isAuthenticated={isAuthenticated} />
      <LandingKeyStats />
      <LandingAIFeatures />
      <LandingClinicalFocus />
      <section className="py-20 bg-surface-container">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-headline-landing font-bold text-primary">
            {t('landing.calculator_cta.title')}
          </h2>
          <p className="mt-3 text-on-surface-variant">
            {t('landing.calculator_cta.subtitle')}
          </p>
          <Link
            href="/calculadora-macros"
            className="mt-6 inline-block rounded-xl bg-brand-primary px-8 py-3 font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            {t('landing.calculator_cta.cta')}
          </Link>
        </div>
      </section>
      <LandingVisualDemo />
      <LandingPricing />
      <LandingFAQ />
      <LandingCTA isAuthenticated={isAuthenticated} />
      <LandingFooter />
    </main>
  );
};
