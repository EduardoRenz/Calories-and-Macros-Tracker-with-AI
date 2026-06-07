'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useFeatureFlags } from '../../contexts/FeatureFlagContext';
import { RepositoryFactory } from '../../data/RepositoryFactory';
import { Plan } from '../../domain/entities/payment';
import { PlanCard } from '../payment/PlanCard';
import { useLanguage } from '../../contexts/LanguageContext';
import { FeatureFlags } from '../../domain/repositories/FeatureFlagRepository';
export const LandingPricing: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { isFeatureEnabled } = useFeatureFlags();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isEnabled = isFeatureEnabled(FeatureFlags.ENABLE_PLANS);

  useEffect(() => {
    if (!isEnabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(false);
        const plansRepository = RepositoryFactory.getPlansRepository();
        const result = await plansRepository.getPlans(language);
        if (!cancelled) {
          setPlans(result);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('LandingPricing: failed to fetch plans', err);
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPlans();

    return () => {
      cancelled = true;
    };
  }, [isEnabled, language]);

  if (!isEnabled) {
    return null;
  }

  return (
    <section className="py-24 bg-surface-container-lowest relative" id="pricing">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-4">
            {t('landing.pricing.title')}
          </h2>
          <p className="text-lg text-on-surface-variant">
            {t('landing.pricing.subtitle')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {loading ? (
            <>
              <div className="bg-surface rounded-[2rem] p-8 border border-outline-variant flex flex-col animate-pulse">
                <div className="h-6 bg-surface-variant rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-surface-variant rounded w-2/3 mb-6"></div>
                <div className="h-10 bg-surface-variant rounded w-1/2 mb-8"></div>
                <div className="space-y-3 mb-8 flex-1">
                  <div className="h-4 bg-surface-variant rounded w-full"></div>
                  <div className="h-4 bg-surface-variant rounded w-full"></div>
                  <div className="h-4 bg-surface-variant rounded w-3/4"></div>
                  <div className="h-4 bg-surface-variant rounded w-1/2"></div>
                </div>
                <div className="h-12 bg-surface-variant rounded-full w-full"></div>
              </div>
              <div className="bg-surface rounded-[2rem] p-8 border border-outline-variant flex flex-col animate-pulse">
                <div className="h-6 bg-surface-variant rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-surface-variant rounded w-2/3 mb-6"></div>
                <div className="h-10 bg-surface-variant rounded w-1/2 mb-8"></div>
                <div className="space-y-3 mb-8 flex-1">
                  <div className="h-4 bg-surface-variant rounded w-full"></div>
                  <div className="h-4 bg-surface-variant rounded w-full"></div>
                  <div className="h-4 bg-surface-variant rounded w-3/4"></div>
                  <div className="h-4 bg-surface-variant rounded w-1/2"></div>
                </div>
                <div className="h-12 bg-surface-variant rounded-full w-full"></div>
              </div>
            </>
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <p className="text-on-surface-variant">{t('landing.pricing.error')}</p>
            </div>
          ) : (
            plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSelect={() => {
                  window.location.href = '/login';
                }}
                ctaLabel={
                  plan.price === 0
                    ? t('landing.pricing.cta_free')
                    : t('landing.pricing.cta_member')
                }
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};
