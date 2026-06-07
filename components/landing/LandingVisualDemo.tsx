'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useTranslation } from '../../hooks/useTranslation';
import MacroProgressCard from '../MacroProgressCard';
import { LumiIcon } from '../icons';

const CHART_DATA = [
  { name: 'Protein', value: 120, color: 'var(--brand-protein)' },
  { name: 'Carbs', value: 150, color: 'var(--brand-carbs)' },
  { name: 'Fats', value: 55, color: 'var(--brand-fats)' },
];

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
              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">
                <div className="relative w-36 h-36 shrink-0 justify-self-center md:justify-self-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={CHART_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius="65%"
                        outerRadius="90%"
                        paddingAngle={4}
                        dataKey="value"
                        cornerRadius={6}
                      >
                        {CHART_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-on-surface-variant font-label">Total</span>
                    <span className="text-lg font-headline font-bold text-on-surface">1.350</span>
                    <span className="text-[10px] text-on-surface-variant font-label">kcal</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <MacroProgressCard
                    title={t('landing.demo.dashboard_calories_label')}
                    current={1350}
                    goal={1800}
                    unit="kcal"
                    color="bg-secondary"
                    className="!bg-transparent !p-0 !rounded-none"
                  />
                  <MacroProgressCard
                    title={t('landing.demo.dashboard_protein_label')}
                    current={120}
                    goal={150}
                    unit="g"
                    color="bg-brand-protein"
                    className="!bg-transparent !p-0 !rounded-none"
                    testId="landing-demo-protein-goal"
                  />
                  <MacroProgressCard
                    title={t('landing.demo.dashboard_carbs_label')}
                    current={150}
                    goal={250}
                    unit="g"
                    color="bg-brand-carbs"
                    className="!bg-transparent !p-0 !rounded-none"
                    testId="landing-demo-carbs-goal"
                  />
                  <MacroProgressCard
                    title={t('landing.demo.dashboard_fats_label')}
                    current={55}
                    goal={75}
                    unit="g"
                    color="bg-brand-fats"
                    className="!bg-transparent !p-0 !rounded-none"
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
              <div className="flex gap-3 justify-end">
                <div className="bg-primary text-on-primary p-3 rounded-2xl rounded-tr-sm text-sm">
                  {t('landing.demo.chat_user_meal')}
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                  <LumiIcon className="w-full h-full" />
                </div>
                <div className="flex-1 bg-surface rounded-xl p-4 border border-outline-variant/40 shadow-sm">
                  <h4 className="font-bold text-sm mb-1 text-on-surface">
                    {t('landing.demo.chat_card_title')}
                  </h4>
                  <p className="text-sm text-on-surface-variant mb-3">
                    {t('landing.demo.chat_card_desc')}
                  </p>
                  <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/30">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="text-on-surface-variant text-xs">{t('landing.demo.chat_card_label_protein')}</p>
                        <p className="font-bold text-brand-protein">{t('landing.demo.chat_card_protein')}</p>
                      </div>
                      <div>
                        <p className="text-on-surface-variant text-xs">{t('landing.demo.chat_card_label_carbs')}</p>
                        <p className="font-bold text-brand-carbs">{t('landing.demo.chat_card_carbs')}</p>
                      </div>
                      <div>
                        <p className="text-on-surface-variant text-xs">{t('landing.demo.chat_card_label_fats')}</p>
                        <p className="font-bold text-brand-fats">{t('landing.demo.chat_card_fats')}</p>
                      </div>
                      <div>
                        <p className="text-on-surface-variant text-xs">{t('landing.demo.chat_card_label_fiber')}</p>
                        <p className="font-bold text-brand-fiber">{t('landing.demo.chat_card_fiber')}</p>
                      </div>
                    </div>
                    <div className="text-center border-t border-outline-variant/30 pt-2 mt-2">
                      <p className="text-on-surface-variant text-xs">{t('landing.demo.chat_card_label_calories')}</p>
                      <p className="font-bold text-on-surface text-lg">{t('landing.demo.chat_card_calories')} kcal</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span className="flex-1 py-2 px-3 rounded-lg bg-surface-container-high text-on-surface text-sm font-semibold text-center opacity-60">
                      {t('landing.demo.chat_card_cancel')}
                    </span>
                    <span className="flex-1 py-2 px-3 rounded-lg bg-primary text-on-primary text-sm font-semibold text-center">
                      {t('landing.demo.chat_card_confirm')}
                    </span>
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
