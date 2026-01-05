import React from 'react';
import Link from 'next/link';
import { HealthPalLogo } from './icons';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';


const PublicNavbar: React.FC = () => {
    const { language, setLanguage } = useLanguage();
    const { t } = useTranslation();

    return (
        <nav className="bg-healthpal-dark border-b border-healthpal-border">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2">
                        <HealthPalLogo className="h-8 w-8 text-healthpal-green" />
                        <span className="text-xl font-bold text-healthpal-text-primary">CalorieApp</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as Language)}
                            className="bg-healthpal-card border border-healthpal-border rounded-lg px-3 py-2 text-sm text-healthpal-text-primary focus:ring-2 focus:ring-healthpal-green focus:border-transparent outline-none cursor-pointer"
                            style={{ colorScheme: 'dark' }}
                        >
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="pt">Português (Brasil)</option>
                        </select>
                        <Link
                            href="/"
                            className="text-healthpal-text-secondary hover:text-healthpal-green transition-colors text-sm font-medium"
                        >
                            ← {t('navbar.back_to_home') || 'Back to Home'}
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default PublicNavbar;
