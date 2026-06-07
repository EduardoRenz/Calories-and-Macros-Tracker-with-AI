'use client';

import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { TimerIcon, CenterFocusStrongIcon, InsightsIcon } from '../icons';

export const LandingKeyStats: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-surface-container-lowest" id="benefits">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-16">
          {t('landing.benefits.title')}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-surface rounded-[2rem] p-8 shadow-sm border border-surface-variant flex flex-col items-center text-center hover:shadow-md transition-shadow duration-300 hover:scale-[1.02]">
            <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container mb-6">
              <TimerIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-headline font-semibold text-on-surface mb-3">{t('landing.benefits.stat_1_title')}</h3>
            <p className="text-on-surface-variant text-body-md">{t('landing.benefits.stat_1_desc')}</p>
          </div>
          <div className="bg-surface rounded-[2rem] p-8 shadow-sm border border-surface-variant flex flex-col items-center text-center hover:shadow-md transition-shadow duration-300 hover:scale-[1.02]">
            <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container mb-6">
              <CenterFocusStrongIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-headline font-semibold text-on-surface mb-3">{t('landing.benefits.stat_2_title')}</h3>
            <p className="text-on-surface-variant text-body-md">{t('landing.benefits.stat_2_desc')}</p>
          </div>
          <div className="bg-surface rounded-[2rem] p-8 shadow-sm border border-surface-variant flex flex-col items-center text-center hover:shadow-md transition-shadow duration-300 hover:scale-[1.02]">
            <div className="w-16 h-16 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container mb-6">
              <InsightsIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-headline font-semibold text-on-surface mb-3">{t('landing.benefits.stat_3_title')}</h3>
            <p className="text-on-surface-variant text-body-md">{t('landing.benefits.stat_3_desc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
