'use client';

import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { KineticButton } from './KineticButton';
import { BoltIcon, LockIcon } from '../icons';

export const LandingCTA: React.FC<{ isAuthenticated?: boolean }> = ({ isAuthenticated = false }) => {
  const { t } = useTranslation();
  const buttonHref = isAuthenticated ? '/dashboard' : '/login';
  const buttonLabel = isAuthenticated ? t('landing.cta.button_dashboard') : t('landing.cta.button');

  return (
    <section className="py-24 bg-surface-container relative overflow-hidden" id="login">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="bg-surface rounded-[3rem] p-10 md:p-16 shadow-lg border border-outline-variant/20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-headline-landing font-bold text-primary mb-4">
              {t('landing.cta.title')}
            </h2>
            <p className="text-on-surface-variant mb-8">
              {t('landing.cta.subtitle')}
            </p>
            <div className="hidden md:block">
              <div className="flex items-center gap-4 text-sm font-label text-on-surface-variant mb-2">
                <BoltIcon className="w-5 h-5 text-secondary" />
                {t('landing.cta.check_instant')}
              </div>
              <div className="flex items-center gap-4 text-sm font-label text-on-surface-variant">
                <LockIcon className="w-5 h-5 text-secondary" />
                {t('landing.cta.check_secure')}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-6 bg-surface-container-lowest p-8 rounded-2xl border border-surface-variant shadow-sm">
            <KineticButton href={buttonHref} size="lg" className="w-full sm:w-auto">
              {buttonLabel}
            </KineticButton>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
    </section>
  );
};
