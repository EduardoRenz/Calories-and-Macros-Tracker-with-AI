'use client';
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export type Language = 'en' | 'es' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LANGUAGE_STORAGE_KEY = 'calories-tracker-language';

const getSystemLanguage = (): Language | null => {
  if (typeof window === 'undefined') return null;
  const system = window.navigator.language.toLowerCase();
  if (system.startsWith('pt')) return 'pt';
  if (system.startsWith('es')) return 'es';
  if (system.startsWith('en')) return 'en';
  return null;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');

  useEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored) {
      setLanguage(stored as Language);
    } else {
      const systemLang = getSystemLanguage();
      if (systemLang) {
        setLanguage(systemLang);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
