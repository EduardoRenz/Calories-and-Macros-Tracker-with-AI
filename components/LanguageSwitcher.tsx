'use client';

import React from 'react';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { BaseSwitcher, SwitcherOption } from './ui/BaseSwitcher';

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();
    const { t } = useTranslation();

    const options: SwitcherOption<Language>[] = [
        { code: 'pt', label: 'PT' },
        { code: 'en', label: 'EN' },
        { code: 'es', label: 'ES' },
    ].map(lang => ({
        id: lang.code,
        value: lang.code as Language,
        label: lang.label
    }));

    return (
        <BaseSwitcher
            label={t('settings.general.language')}
            options={options}
            selectedValue={language}
            onChange={(value) => setLanguage(value)}
        />
    );
}
