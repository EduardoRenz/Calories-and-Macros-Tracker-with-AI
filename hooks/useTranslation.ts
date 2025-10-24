import { useLanguage } from '../contexts/LanguageContext';
import en from '../locales/en';
import es from '../locales/es';
import pt from '../locales/pt';

// FIX: Changed type to `Record<string, any>` to correctly handle nested translation objects
// and resolve the TypeScript error in the `reduce` function below.
const translations: Record<string, any> = { en, es, pt };

// Helper to access nested keys like 'profile.personal_info.title'
function getNestedTranslation(language: string, key: string): string | undefined {
  const result = key.split('.').reduce((obj, k) => {
    return obj && typeof obj === 'object' ? obj[k] : undefined;
  }, translations[language]);

  if (typeof result === 'string') {
    return result;
  }

  return undefined;
}


export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key: string): string => {
    const translation = getNestedTranslation(language, key);
    return translation || key;
  };

  return { t };
};
