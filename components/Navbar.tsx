'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HealthPalLogo, SparklesIcon, SettingsIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
    onQuickMealClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onQuickMealClick }) => {
    const { t } = useTranslation();
    const { user } = useAuth();

    const navItems = [
        { path: '/dashboard', label: 'dashboard' },
        { path: '/profile', label: 'profile' },
        { path: '/settings', label: 'settings' }
    ];

    const getInitials = (name: string | null | undefined) => {
        if (!name) return '';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    return (
        <header className="flex justify-between items-center px-6 lg:px-8 pt-6 lg:pt-8 border-b border-healthpal-border pb-4">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                    <HealthPalLogo className="h-8 w-8 text-healthpal-green" />
                    <h1 className="text-2xl font-bold">CalorieApp</h1>
                </div>
                <nav className="hidden md:flex items-center gap-6" data-testid="desktop-nav">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`py-1 text-md font-medium transition-colors ${usePathname() === item.path
                                ? 'text-healthpal-green border-b-2 border-healthpal-green'
                                : 'text-healthpal-text-secondary hover:text-healthpal-text-primary'
                                }`}
                        >
                            {t(`navbar.${item.label}`)}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={onQuickMealClick}
                    className="bg-healthpal-green text-black font-bold py-2 px-4 rounded-lg hover:brightness-110 transition-all text-sm hidden md:flex items-center gap-2"
                >
                    <SparklesIcon className="w-5 h-5" />
                    <span>{t('navbar.quick_meal')}</span>
                </button>
                <Link
                    href="/settings"
                    className="p-2 rounded-full md:hidden text-healthpal-text-secondary hover:bg-healthpal-card"
                    aria-label={t('navbar.settings')}
                >
                    <SettingsIcon className="w-6 h-6" />
                </Link>
                <div className="w-10 h-10 bg-healthpal-card rounded-full flex items-center justify-center border-2 border-healthpal-border overflow-hidden">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-bold text-healthpal-text-secondary">{getInitials(user?.displayName)}</span>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;