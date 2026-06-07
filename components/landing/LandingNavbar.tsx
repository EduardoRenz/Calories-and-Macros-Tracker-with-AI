'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '../../hooks/useTranslation';
import LanguageSwitcher from '../LanguageSwitcher';
import ThemeSwitcher from '../ThemeSwitcher';
import { KineticButton } from './KineticButton';

interface LandingNavbarProps {
  isAuthenticated?: boolean;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ isAuthenticated = false }) => {
  const { t } = useTranslation();

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-headline-md font-headline font-bold text-primary dark:text-primary-fixed flex items-center gap-2"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            Levemente
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-on-surface-variant dark:text-outline-variant font-medium font-label hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200"
            >
              {t('landing.navbar.features')}
            </a>
            <a
              href="#benefits"
              className="text-on-surface-variant dark:text-outline-variant font-medium font-label hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200"
            >
              {t('landing.navbar.benefits')}
            </a>
            <a
              href="#pricing"
              className="text-on-surface-variant dark:text-outline-variant font-medium font-label hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200"
            >
              {t('landing.navbar.pricing')}
            </a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeSwitcher />
          {isAuthenticated ? (
            <KineticButton href="/dashboard" size="sm">
              {t('landing.navbar.dashboard')}
            </KineticButton>
          ) : (
            <>
              <Link
                href="/login"
                className="text-primary font-label font-semibold px-4 py-2 hover:bg-surface-container rounded-full transition-colors"
              >
                {t('landing.navbar.login')}
              </Link>
              <KineticButton href="/login" size="sm">
                {t('landing.navbar.start')}
              </KineticButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
