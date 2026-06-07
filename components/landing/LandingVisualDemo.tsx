'use client';

import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import MacroProgressCard from '../MacroProgressCard';

export const LandingVisualDemo: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-surface" id="features">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-4">
            {t('landing.demo.title')}
          </h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            {t('landing.demo.subtitle')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/30 flex flex-col h-full group hover:bg-surface-container transition-colors">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-headline font-bold text-on-surface">{t('landing.demo.dashboard_title')}</h3>
                <p className="text-on-surface-variant mt-2">{t('landing.demo.dashboard_subtitle')}</p>
              </div>
              <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center text-on-primary-container">
                <span className="material-symbols-outlined">donut_large</span>
              </div>
            </div>
            <div className="mt-auto bg-surface rounded-xl p-6 shadow-sm border border-surface-variant group-hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-center gap-6">
                <div className="relative w-24 h-24 shrink-0">
                  <svg className="w-full h-full text-secondary stroke-current" viewBox="0 0 36 36">
                    <path className="text-surface-variant" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" stroke="currentColor" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray="75, 100" strokeLinecap="round" strokeWidth="3" stroke="currentColor" className="text-secondary" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-headline font-bold text-on-surface">75%</span>
                    <span className="text-[10px] font-label text-on-surface-variant">{t('landing.demo.dashboard_calories_label')}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <MacroProgressCard
                    title={t('landing.demo.dashboard_protein_label')}
                    current={120}
                    goal={150}
                    unit="g"
                    color="bg-primary"
                    className="!bg-transparent !p-0 !rounded-none"
                    testId="landing-demo-protein-goal"
                  />
                  <MacroProgressCard
                    title={t('landing.demo.dashboard_carbs_label')}
                    current={150}
                    goal={250}
                    unit="g"
                    color="bg-tertiary-fixed-dim"
                    className="!bg-transparent !p-0 !rounded-none"
                    testId="landing-demo-carbs-goal"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/30 flex flex-col h-full group hover:bg-surface-container transition-colors">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-headline font-bold text-on-surface">{t('landing.demo.chat_title')}</h3>
                <p className="text-on-surface-variant mt-2">{t('landing.demo.chat_subtitle')}</p>
              </div>
              <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined">edit_note</span>
              </div>
            </div>
            <div className="mt-auto bg-surface rounded-xl p-6 shadow-sm border border-surface-variant group-hover:scale-[1.02] transition-transform flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-sm">robot_2</span>
                </div>
                <div className="bg-surface-container-low p-3 rounded-2xl rounded-tl-sm text-sm text-on-surface">
                  {t('landing.demo.chat_prompt')}
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <div className="bg-primary text-on-primary p-3 rounded-2xl rounded-tr-sm text-sm">
                  {t('landing.demo.chat_user_meal')}
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <div className="bg-surface-container-low p-3 rounded-2xl rounded-tl-sm text-sm text-on-surface border border-secondary/30">
                  <span className="font-bold text-secondary block mb-1">{t('landing.demo.chat_success')}</span>
                  <div className="flex gap-2 text-xs text-on-surface-variant">
                    <span>{t('landing.demo.chat_macros')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
