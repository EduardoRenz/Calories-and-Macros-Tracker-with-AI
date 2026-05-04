'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { BaseSwitcher, SwitcherOption } from './ui/BaseSwitcher';

export default function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="h-[48px]" />; // Placeholder to avoid layout shift
    }

    const options: SwitcherOption<string>[] = [
        {
            id: 'light',
            value: 'light',
            title: 'Light',
            label: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        },
        {
            id: 'system',
            value: 'system',
            title: 'System',
            label: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            id: 'dark',
            value: 'dark',
            title: 'Dark',
            label: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            )
        }
    ];

    return (
        <BaseSwitcher
            label={t('settings.theme')}
            options={options}
            selectedValue={theme || 'system'}
            onChange={(value) => setTheme(value)}
        />
    );
}
