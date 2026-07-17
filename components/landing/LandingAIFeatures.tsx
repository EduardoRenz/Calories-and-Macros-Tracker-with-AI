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
            <div className="w-full max-w-md mx-auto aspect-square bg-surface rounded-[3rem] shadow-xl overflow-hidden p-0 flex items-center justify-center relative z-10 border-2 border-secondary">
              <img
                src="/images/table.webp"
                alt="Nutritional table analysis preview"
                className="w-full h-full object-cover rounded-[2.85rem]"
              />
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
