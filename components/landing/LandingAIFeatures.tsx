'use client';

import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { ChatBubbleLeftRightIcon, SpeedIcon } from '../icons';

export const LandingAIFeatures: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-surface-container relative overflow-hidden" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="w-full max-w-md mx-auto aspect-square bg-surface rounded-[3rem] shadow-xl overflow-hidden p-8 flex items-center justify-center relative z-10 border border-outline-variant/30">
              <svg
                role="img"
                aria-label="AI brain logo"
                viewBox="0 0 200 200"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient id="brain-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--primary, #006664)" />
                    <stop offset="100%" stopColor="var(--secondary, #00bd7b)" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="80" fill="url(#brain-grad)" opacity="0.12" />
                <path
                  d="M70 50c-12 0-22 10-22 22 0 4 1 7 3 10-6 3-10 9-10 17 0 9 6 16 14 18v6c0 5 4 9 9 9h72c5 0 9-4 9-9v-6c8-2 14-9 14-18 0-8-4-14-10-17 2-3 3-6 3-10 0-12-10-22-22-22-3 0-6 1-9 2-3-5-9-8-15-8s-12 3-15 8c-3-1-6-2-9-2z"
                  fill="url(#brain-grad)"
                  opacity="0.85"
                />
                <g stroke="var(--surface-container-lowest, #ffffff)" strokeWidth="3" strokeLinecap="round" fill="none">
                  <path d="M82 78c4 0 8 4 8 10s-4 10-8 10" />
                  <path d="M118 78c-4 0-8 4-8 10s4 10 8 10" />
                  <path d="M82 110c0 6 8 12 18 12s18-6 18-12" />
                  <circle cx="100" cy="100" r="3" fill="var(--surface-container-lowest, #ffffff)" />
                </g>
                <g stroke="var(--secondary, #00bd7b)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7">
                  <path d="M100 30v10" />
                  <path d="M100 160v10" />
                  <path d="M30 100h10" />
                  <path d="M160 100h10" />
                  <circle cx="100" cy="35" r="2" fill="var(--secondary, #00bd7b)" />
                  <circle cx="100" cy="165" r="2" fill="var(--secondary, #00bd7b)" />
                  <circle cx="35" cy="100" r="2" fill="var(--secondary, #00bd7b)" />
                  <circle cx="165" cy="100" r="2" fill="var(--secondary, #00bd7b)" />
                </g>
              </svg>
            </div>
            <div className="absolute top-10 -left-10 w-24 h-24 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-10 -right-10 w-32 h-32 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-50 pointer-events-none"></div>
          </div>
          <div className="order-1 lg:order-2">
            <span className="text-secondary font-label font-bold tracking-wider uppercase text-sm mb-2 block">
              {t('landing.ai_features.eyebrow')}
            </span>
            <h2 className="text-3xl md:text-4xl font-headline-landing font-bold text-primary mb-6">
              {t('landing.ai_features.title')}
            </h2>
            <p className="text-lg text-on-surface-variant mb-8 leading-relaxed">
              {t('landing.ai_features.description')}
            </p>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0 shadow-sm">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-headline-landing font-semibold text-on-surface text-lg">{t('landing.ai_features.natural_input_title')}</h4>
                  <p className="text-on-surface-variant mt-1">{t('landing.ai_features.natural_input_desc')}</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0 shadow-sm">
                  <SpeedIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-headline-landing font-semibold text-on-surface text-lg">{t('landing.ai_features.instant_calc_title')}</h4>
                  <p className="text-on-surface-variant mt-1">{t('landing.ai_features.instant_calc_desc')}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
