'use client';

import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

export const LandingClinicalFocus: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-surface-container-low rounded-[3rem] p-10 md:p-16 overflow-hidden relative shadow-sm border border-outline-variant/20">
          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <span className="inline-block py-1 px-3 rounded-full bg-error-container text-on-error-container font-label text-xs font-bold mb-4">
                {t('landing.clinical.badge')}
              </span>
              <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-6">
                {t('landing.clinical.title')}
              </h2>
              <p className="text-lg text-on-surface-variant mb-6 leading-relaxed">
                {t('landing.clinical.description')}
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-surface p-4 rounded-2xl shadow-sm border border-surface-variant">
                  <span className="material-symbols-outlined text-secondary mb-2 text-3xl">water_drop</span>
                  <h4 className="font-label font-bold text-on-surface">{t('landing.clinical.diabetes_title')}</h4>
                  <p className="text-xs text-on-surface-variant mt-1">{t('landing.clinical.diabetes_desc')}</p>
                </div>
                <div className="bg-surface p-4 rounded-2xl shadow-sm border border-surface-variant">
                  <span className="material-symbols-outlined text-secondary mb-2 text-3xl">no_meals</span>
                  <h4 className="font-label font-bold text-on-surface">{t('landing.clinical.intolerances_title')}</h4>
                  <p className="text-xs text-on-surface-variant mt-1">{t('landing.clinical.intolerances_desc')}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-sm aspect-square bg-surface rounded-full shadow-lg p-6 border-4 border-surface flex items-center justify-center">
                <svg
                  role="img"
                  aria-label="Medical wellness bowl logo"
                  viewBox="0 0 200 200"
                  className="w-full h-full"
                >
                  <defs>
                    <linearGradient id="bowl-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="var(--secondary, #00bd7b)" />
                      <stop offset="100%" stopColor="var(--primary, #006664)" />
                    </linearGradient>
                  </defs>
                  <ellipse cx="100" cy="160" rx="70" ry="10" fill="var(--primary, #006664)" opacity="0.12" />
                  <path
                    d="M40 100c0 33 27 60 60 60s60-27 60-60z"
                    fill="url(#bowl-grad)"
                    opacity="0.9"
                  />
                  <ellipse cx="100" cy="100" rx="60" ry="14" fill="var(--surface-container-lowest, #ffffff)" opacity="0.5" />
                  <g transform="translate(100 90)">
                    <path
                      d="M0 -22c-12 0-22 10-22 22 0 14 22 30 22 30s22-16 22-30c0-12-10-22-22-22z"
                      fill="var(--primary, #006664)"
                    />
                    <path
                      d="M0 -10c-6 0-10 4-10 10 0 6 10 14 10 14s10-8 10-14c0-6-4-10-10-10z"
                      fill="var(--secondary, #00bd7b)"
                    />
                    <path
                      d="M-20 0c-8 0-14 6-14 14 0 8 14 18 14 18s14-10 14-18c0-8-6-14-14-14z"
                      fill="var(--secondary, #00bd7b)"
                      opacity="0.7"
                    />
                    <path
                      d="M20 0c-8 0-14 6-14 14 0 8 14 18 14 18s14-10 14-18c0-8-6-14-14-14z"
                      fill="var(--primary, #006664)"
                      opacity="0.7"
                    />
                  </g>
                </svg>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-24 -right-24 text-[300px] text-surface font-headline font-black opacity-40 select-none pointer-events-none">
            +
          </div>
        </div>
      </div>
    </section>
  );
};
