'use client';
import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';

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

const getStoredLanguage = (): Language => {
  if (typeof window === 'undefined') return 'pt';
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored) return stored as Language;
  return getSystemLanguage() || 'pt';
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');
  const hasUserInteractedRef = useRef(false);

  useEffect(() => {
    if (!hasUserInteractedRef.current) {
      setLanguage(getStoredLanguage());
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    hasUserInteractedRef.current = true;
    setLanguage(lang);
  };

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
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
