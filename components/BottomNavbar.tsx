'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, UserIcon, SparklesIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';

interface BottomNavbarProps {
    onQuickMealClick: () => void;
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({ onQuickMealClick }) => {
    const { t } = useTranslation();
    const pathname = usePathname();

    const navItems = [
        { path: '/dashboard', icon: <HomeIcon className="w-6 h-6" />, label: t('navbar.dashboard') },
        { path: '/profile', icon: <UserIcon className="w-6 h-6" />, label: t('navbar.profile') }
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-healthpal-panel/80 backdrop-blur-sm border-t border-healthpal-border z-40">
            <nav className="flex items-center justify-around h-full max-w-md mx-auto px-2" data-testid="mobile-nav">
                {navItems.map((item, index) => (
                    <div key={item.path} className="w-1/3">
                        {index === 1 && <div className="w-1/3" />}
                        <Link
                            href={item.path}
                            className={`flex flex-col items-center justify-center w-full h-full pt-1 transition-colors ${pathname === item.path
                                ? 'text-healthpal-green'
                                : 'text-healthpal-text-secondary hover:text-healthpal-text-primary'
                                }`}
                        >
                            {item.icon}
                            <span className="text-xs mt-1">{item.label}</span>
                        </Link>
                    </div>
                ))}
            </nav>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <button
                    onClick={onQuickMealClick}
                    className="w-16 h-16 bg-healthpal-green rounded-full flex items-center justify-center text-black shadow-lg shadow-black/30 hover:brightness-110 transition-all"
                    aria-label={t('navbar.quick_meal')}
                >
                    <SparklesIcon className="w-8 h-8" />
                </button>
            </div>
        </div>
    );
};

export default BottomNavbar;
