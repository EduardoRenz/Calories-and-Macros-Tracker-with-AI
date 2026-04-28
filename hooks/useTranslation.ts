import { useCallback, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import en from '../locales/en';
import es from '../locales/es';
import pt from '../locales/pt';

// ... (translations mapping remains same)
const translations: Record<string, any> = { en, es, pt };

function getNestedValue(language: string, key: string): any {
  return key.split('.').reduce((obj, k) => {
    return obj && typeof obj === 'object' ? obj[k] : undefined;
  }, translations[language]);
}

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = useCallback((key: string, data?: Record<string, string | number>): string => {
    const value = getNestedValue(language, key);
    let translation = typeof value === 'string' ? value : key;

    if (data && typeof translation === 'string') {
      Object.entries(data).forEach(([k, v]) => {
        translation = translation.replace(`{{${k}}}`, String(v));
      });
    }

    return translation;
  }, [language]);

  /**
   * Translates to an object or array
   */
  const to = useCallback(<T = any>(key: string): T | undefined => {
    return getNestedValue(language, key);
  }, [language]);

  return useMemo(() => ({ t, to }), [t, to]);
};
