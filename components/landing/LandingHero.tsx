'use client';

import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { KineticButton } from './KineticButton';
import { BoltIcon, CheckIcon, CheckCircleIcon } from '../icons';
import { HeroAppPreview } from './HeroAppPreview';

export const LandingHero: React.FC<{ isAuthenticated?: boolean }> = ({ isAuthenticated = false }) => {
  const { t } = useTranslation();
  const heroTitle = t('landing.hero.title');
  const heroAccent = t('landing.hero.title_accent');
  const heroPrefix = heroTitle.endsWith(heroAccent)
    ? heroTitle.slice(0, heroTitle.length - heroAccent.length)
    : heroTitle;
  const primaryCtaHref = isAuthenticated ? '/dashboard' : '/login';
  const primaryCtaLabel = isAuthenticated ? t('landing.hero.cta_dashboard') : t('landing.hero.cta_start');

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div className="z-10 flex flex-col items-start gap-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full font-label text-sm font-semibold">
            <BoltIcon className="w-4 h-4" />
            {t('landing.hero.badge')}
          </div>
          <h1 className="text-5xl lg:text-6xl font-headline-landing font-bold text-primary leading-tight tracking-tight">
            {heroPrefix}
            <span className="text-secondary">{heroAccent}</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed">
            {t('landing.hero.subtitle')}
          </p>
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-3 text-sm text-on-surface-variant font-label">
              <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <CheckIcon className="w-4 h-4 text-on-secondary" />
              </span>
              {t('landing.hero.check_auto_macros')}
            </span>
            <span className="flex items-center gap-3 text-sm text-on-surface-variant font-label">
              <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <CheckIcon className="w-4 h-4 text-on-secondary" />
              </span>
              {t('landing.hero.check_instant_analysis')}
            </span>
            <span className="flex items-center gap-3 text-sm text-on-surface-variant font-label">
              <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <CheckIcon className="w-4 h-4 text-on-secondary" />
              </span>
              {t('landing.hero.check_goals_tracking')}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
            <KineticButton href={primaryCtaHref} size="md">
              {primaryCtaLabel}
            </KineticButton>
            {/*
            <a
              href="#how-it-works"
              className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-outline-variant text-on-surface font-label font-semibold rounded-full hover:border-primary hover:text-primary transition-colors"
            >
              <PlayCircleIcon className="w-5 h-5" />
              {t('landing.hero.cta_how')}
            </a>
            */}
          </div>
          <div className="flex items-center gap-4 mt-6 text-sm text-on-surface-variant font-label flex-wrap">
            <span className="flex items-center gap-1">
              <CheckCircleIcon className="w-5 h-5 text-secondary" />
              {t('landing.hero.check_no_forms')}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircleIcon className="w-5 h-5 text-secondary" />
              {t('landing.hero.check_setup')}
            </span>
          </div>
        </div>
        <div className="relative z-10 w-full h-[500px] lg:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl bg-gradient-to-br from-primary-container via-surface to-secondary-container flex items-center justify-center">
          <HeroAppPreview />
        </div>
      </div>
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-fixed-dim/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary-fixed/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
    </section>
  );
};
