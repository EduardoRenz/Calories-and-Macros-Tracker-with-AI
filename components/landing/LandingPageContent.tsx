'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LandingNavbar } from './LandingNavbar';
import { LandingHero } from './LandingHero';
import { LandingKeyStats } from './LandingKeyStats';
import { LandingAIFeatures } from './LandingAIFeatures';
import { LandingClinicalFocus } from './LandingClinicalFocus';
import { LandingVisualDemo } from './LandingVisualDemo';
import { LandingPricing } from './LandingPricing';
import { LandingCTA } from './LandingCTA';
import { LandingFooter } from './LandingFooter';

export const LandingPageContent: React.FC = () => {
  const { user, loading } = useAuth();
  const isAuthenticated = !loading && !!user;

  return (
    <main className="scroll-smooth">
      <LandingNavbar isAuthenticated={isAuthenticated} />
      <LandingHero isAuthenticated={isAuthenticated} />
      <LandingKeyStats />
      <LandingAIFeatures />
      <LandingClinicalFocus />
      <LandingVisualDemo />
      <LandingPricing />
      <LandingCTA isAuthenticated={isAuthenticated} />
      <LandingFooter />
    </main>
  );
};
