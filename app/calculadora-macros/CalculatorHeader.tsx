'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function CalculatorHeader() {
  const { t } = useTranslation();
  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-headline-landing font-bold text-on-surface">
        {t('calculator.page_title')}
      </h1>
      <p className="mt-2 text-on-surface-variant">
        {t('calculator.page_subtitle')}
      </p>
    </div>
  );
}
