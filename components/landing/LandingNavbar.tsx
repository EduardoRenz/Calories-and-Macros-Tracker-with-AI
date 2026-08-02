'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '../../hooks/useTranslation';
import LanguageSwitcher from '../LanguageSwitcher';
import ThemeSwitcher from '../ThemeSwitcher';
import { KineticButton } from './KineticButton';
import { SettingsIcon, MenuIcon, XMarkIcon } from '../icons';

interface LandingNavbarProps {
  isAuthenticated?: boolean;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ isAuthenticated = false }) => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-headline-md font-headline-landing font-bold text-primary dark:text-primary-fixed flex items-center gap-2 shrink-0"
        >
          <Image src="/LogoHorizontal.svg" alt="Levemente Logo" width={200} height={48} className="h-11 w-auto object-contain -mt-1" />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <a
            href="#features"
            className="text-on-surface-variant font-medium font-label hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200"
          >
            {t('landing.navbar.features')}
          </a>
          <a
            href="#benefits"
            className="text-on-surface-variant font-medium font-label hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200"
          >
            {t('landing.navbar.benefits')}
          </a>
          <Link
            href="/calculadora-macros"
            className="text-on-surface-variant font-medium font-label hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200"
          >
            {t('landing.navbar.calculator')}
          </Link>
          <a
            href="#pricing"
            className="text-on-surface-variant font-medium font-label hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200"
          >
            {t('landing.navbar.pricing')}
          </a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher showBorder={false} />
          <ThemeSwitcher showBorder={false} />
          {isAuthenticated ? (
            <KineticButton href="/dashboard" size="sm">
              {t('landing.navbar.dashboard')}
            </KineticButton>
          ) : (
            <KineticButton href="/login" size="sm">
              {t('landing.navbar.start')}
            </KineticButton>
          )}
        </div>

        <div className="flex md:hidden items-center gap-1">
          {!isAuthenticated && (
            <KineticButton href="/login" size="sm" className="!px-3 !py-1.5 !text-xs">
              {t('landing.navbar.start')}
            </KineticButton>
          )}

          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
              aria-label="Settings"
            >
              <SettingsIcon className="w-6 h-6" />
            </button>

            {isSettingsOpen && (
              <div className="absolute right-0 top-full mt-3 w-64 bg-surface border border-outline-variant/30 rounded-2xl shadow-2xl z-50 overflow-hidden ring-1 ring-black/5">
                <div className="p-3 space-y-1">
                  <ThemeSwitcher showBorder={false} />
                  <LanguageSwitcher showBorder={false} />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant/30 bg-surface/95 backdrop-blur-md">
          <div className="flex flex-col px-4 py-4 space-y-1">
            <a
              href="#features"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-3 px-4 text-on-surface-variant font-medium font-label rounded-xl hover:bg-surface-container transition-colors"
            >
              {t('landing.navbar.features')}
            </a>
            <a
              href="#benefits"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-3 px-4 text-on-surface-variant font-medium font-label rounded-xl hover:bg-surface-container transition-colors"
            >
              {t('landing.navbar.benefits')}
            </a>
            <Link
              href="/calculadora-macros"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-3 px-4 text-on-surface-variant font-medium font-label rounded-xl hover:bg-surface-container transition-colors"
            >
              {t('landing.navbar.calculator')}
            </Link>
            <a
              href="#pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-3 px-4 text-on-surface-variant font-medium font-label rounded-xl hover:bg-surface-container transition-colors"
            >
              {t('landing.navbar.pricing')}
            </a>
            {!isAuthenticated && (
              <div className="border-t border-outline-variant/20 pt-3 mt-3">
                <KineticButton href="/login" size="md" className="w-full justify-center">
                  {t('landing.navbar.start')}
                </KineticButton>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
