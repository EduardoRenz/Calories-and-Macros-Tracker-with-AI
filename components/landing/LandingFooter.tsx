'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '../../hooks/useTranslation';
import { EcoIcon } from '../icons';

export const LandingFooter: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer
      data-testid="landing-footer"
      className="w-full bg-surface-container-highest border-t border-outline-variant/30 py-12"
    >
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
        <div className="flex items-center gap-3">
          <EcoIcon className="w-8 h-8 text-primary" aria-hidden="true" />
          <div>
            <p className="font-headline-landing font-bold text-primary text-lg leading-none">
              Levemente
            </p>
            <p className="text-on-surface-variant text-xs mt-1">
              {t('landing.footer.copyright')}
            </p>
          </div>
        </div>
        <nav
          aria-label="Landing footer links"
          className="flex flex-wrap items-center gap-x-6 gap-y-2 md:justify-end text-sm font-label"
        >
          <Link
            href="/privacy-policy"
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            {t('landing.footer.privacy')}
          </Link>
          <Link
            href="/terms-of-use"
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            {t('landing.footer.terms')}
          </Link>
          <a
            href="mailto:contato@levemente.ia.br"
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            {t('landing.footer.support')}
          </a>
        </nav>
      </div>
    </footer>
  );
};
