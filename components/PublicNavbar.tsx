import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { useLanguage, Language } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';


const PublicNavbar: React.FC = () => {
    const { language, setLanguage } = useLanguage();
    const { t } = useTranslation();

    return (
        <nav className="bg-neutral-dark border-b border-neutral-border">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity">
                        <Image src="/LogoHorizontal.svg" alt="LeveMente" width={200} height={64} className="h-16 w-auto" priority />
                    </Link>

                    <div className="flex items-center gap-4">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as Language)}
                            className="bg-neutral-card border border-neutral-border rounded-lg px-3 py-2 text-sm text-neutral-text-primary focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none cursor-pointer"
                            style={{ colorScheme: 'dark' }}
                        >
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="pt">Português (Brasil)</option>
                        </select>
                        <Link
                            href="/"
                            className="text-neutral-text-secondary hover:text-brand-green transition-colors text-sm font-medium"
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
