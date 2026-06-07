'use client';

import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { KineticButton } from './KineticButton';

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
            <span className="material-symbols-outlined text-sm">bolt</span>
            {t('landing.hero.badge')}
          </div>
          <h1 className="text-5xl lg:text-6xl font-headline font-bold text-primary leading-tight tracking-tight">
            {heroPrefix}
            <span className="text-secondary">{heroAccent}</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed">
            {t('landing.hero.subtitle')}
          </p>
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-3 text-sm text-on-surface-variant font-label">
              <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-secondary text-sm">check</span>
              </span>
              {t('landing.hero.check_auto_macros')}
            </span>
            <span className="flex items-center gap-3 text-sm text-on-surface-variant font-label">
              <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-secondary text-sm">check</span>
              </span>
              {t('landing.hero.check_instant_analysis')}
            </span>
            <span className="flex items-center gap-3 text-sm text-on-surface-variant font-label">
              <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-secondary text-sm">check</span>
              </span>
              {t('landing.hero.check_goals_tracking')}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
            <KineticButton href={primaryCtaHref} size="md">
              {primaryCtaLabel}
            </KineticButton>
            <a
              href="#how-it-works"
              className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-outline-variant text-on-surface font-label font-semibold rounded-full hover:border-primary hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">play_circle</span>
              {t('landing.hero.cta_how')}
            </a>
          </div>
          <div className="flex items-center gap-4 mt-6 text-sm text-on-surface-variant font-label flex-wrap">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              {t('landing.hero.check_no_forms')}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              {t('landing.hero.check_setup')}
            </span>
          </div>
        </div>
        <div className="relative z-10 w-full h-[500px] lg:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl bg-gradient-to-br from-primary-container via-surface to-secondary-container flex items-center justify-center">
          <svg
            role="img"
            aria-label="Levemente app dashboard preview"
            viewBox="0 0 280 520"
            className="h-[92%] w-auto drop-shadow-2xl"
          >
            <defs>
              <linearGradient id="phone-bezel" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--primary, #006664)" />
                <stop offset="100%" stopColor="var(--secondary, #00bd7b)" />
              </linearGradient>
              <linearGradient id="phone-screen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--surface-container-lowest, #ffffff)" />
                <stop offset="100%" stopColor="var(--surface-container, #eceeee)" />
              </linearGradient>
            </defs>
            <rect x="6" y="6" width="268" height="508" rx="42" ry="42" fill="url(#phone-bezel)" />
            <rect x="18" y="22" width="244" height="476" rx="32" ry="32" fill="url(#phone-screen)" />
            <rect x="110" y="34" width="60" height="14" rx="7" ry="7" fill="var(--on-surface, #191c1d)" opacity="0.85" />
            <rect x="34" y="68" width="80" height="10" rx="5" fill="var(--on-surface-variant, #3e4948)" opacity="0.5" />
            <rect x="34" y="86" width="140" height="20" rx="6" fill="var(--on-surface, #191c1d)" />
            <g transform="translate(140 188)">
              <circle r="60" fill="none" stroke="var(--surface-variant, #e1e3e3)" strokeWidth="10" />
              <circle r="60" fill="none" stroke="var(--secondary, #00bd7b)" strokeWidth="10" strokeLinecap="round" strokeDasharray="283 377" transform="rotate(-90)" />
              <text textAnchor="middle" y="6" fontSize="22" fontWeight="700" fill="var(--on-surface, #191c1d)">75%</text>
              <text textAnchor="middle" y="26" fontSize="9" fill="var(--on-surface-variant, #3e4948)">Calories</text>
            </g>
            <rect x="34" y="276" width="212" height="44" rx="14" fill="var(--surface-container, #eceeee)" />
            <rect x="44" y="288" width="80" height="8" rx="4" fill="var(--on-surface, #191c1d)" />
            <rect x="44" y="302" width="40" height="6" rx="3" fill="var(--on-surface-variant, #3e4948)" opacity="0.6" />
            <rect x="148" y="290" width="86" height="6" rx="3" fill="var(--surface-variant, #e1e3e3)" />
            <rect x="148" y="290" width="68" height="6" rx="3" fill="var(--brand-protein, #ef4444)" />
            <rect x="34" y="332" width="212" height="44" rx="14" fill="var(--surface-container, #eceeee)" />
            <rect x="44" y="344" width="60" height="8" rx="4" fill="var(--on-surface, #191c1d)" />
            <rect x="44" y="358" width="40" height="6" rx="3" fill="var(--on-surface-variant, #3e4948)" opacity="0.6" />
            <rect x="148" y="346" width="86" height="6" rx="3" fill="var(--surface-variant, #e1e3e3)" />
            <rect x="148" y="346" width="52" height="6" rx="3" fill="var(--brand-carbs, #ff8c42)" />
            <rect x="34" y="388" width="212" height="44" rx="14" fill="var(--surface-container, #eceeee)" />
            <rect x="44" y="400" width="50" height="8" rx="4" fill="var(--on-surface, #191c1d)" />
            <rect x="44" y="414" width="40" height="6" rx="3" fill="var(--on-surface-variant, #3e4948)" opacity="0.6" />
            <rect x="148" y="402" width="86" height="6" rx="3" fill="var(--surface-variant, #e1e3e3)" />
            <rect x="148" y="402" width="35" height="6" rx="3" fill="var(--brand-fats, #ffc107)" />
            <rect x="34" y="450" width="212" height="32" rx="16" fill="var(--primary, #006664)" />
            <rect x="118" y="461" width="44" height="10" rx="5" fill="var(--on-primary, #ffffff)" />
          </svg>
          <div className="absolute bottom-8 left-8 glass-card p-4 rounded-2xl flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
            <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined">restaurant_menu</span>
            </div>
            <div>
              <p className="font-label font-bold text-[#191c1d] text-sm">{t('landing.hero.float_badge_title')}</p>
              <p className="font-body text-xs text-[#3e4948]">{t('landing.hero.float_badge_desc')}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-fixed-dim/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary-fixed/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
    </section>
  );
};
