import { useCallback, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import en from '../locales/en';
import es from '../locales/es';
import pt from '../locales/pt';

// ... (translations mapping remains same)
const translations: Record<string, Record<string, unknown>> = { en, es, pt };

function getNestedValue(language: string, key: string): unknown {
  return key.split('.').reduce((obj, k) => {
    return obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[k] : undefined;
  }, translations[language] as unknown);
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
  const to = useCallback(<T = unknown>(key: string): T | undefined => {
    return getNestedValue(language, key) as T | undefined;
  }, [language]);

  return useMemo(() => ({ t, to }), [t, to]);
};
