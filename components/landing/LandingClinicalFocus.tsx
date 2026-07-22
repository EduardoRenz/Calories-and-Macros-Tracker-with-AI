'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslation } from '../../hooks/useTranslation';
import { WaterDropIcon, NoMealsIcon } from '../icons';

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
              <h2 className="text-3xl md:text-4xl font-headline-landing font-bold text-primary mb-6">
                {t('landing.clinical.title')}
              </h2>
              <p className="text-lg text-on-surface-variant mb-6 leading-relaxed">
                {t('landing.clinical.description')}
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-surface p-4 rounded-2xl shadow-sm border border-surface-variant">
                  <WaterDropIcon className="w-8 h-8 text-secondary mb-2" />
                  <h4 className="font-label font-bold text-on-surface">{t('landing.clinical.diabetes_title')}</h4>
                  <p className="text-xs text-on-surface-variant mt-1">{t('landing.clinical.diabetes_desc')}</p>
                </div>
                <div className="bg-surface p-4 rounded-2xl shadow-sm border border-surface-variant">
                  <NoMealsIcon className="w-8 h-8 text-secondary mb-2" />
                  <h4 className="font-label font-bold text-on-surface">{t('landing.clinical.intolerances_title')}</h4>
                  <p className="text-xs text-on-surface-variant mt-1">{t('landing.clinical.intolerances_desc')}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-sm aspect-square rounded-full overflow-hidden shadow-lg">
                <Image
                  src="/images/Levemente_app.webp"
                  alt="A Bowl with a salad and healthy food"
                  width={1254}
                  height={1254}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          <div className="absolute -bottom-24 -right-24 text-[300px] text-surface font-headline-landing font-black opacity-40 select-none pointer-events-none">
            +
          </div>
        </div>
      </div>
    </section>
  );
};
