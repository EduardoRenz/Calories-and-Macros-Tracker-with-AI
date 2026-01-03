'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HealthPalLogo, SparklesIcon, SettingsIcon, MenuIcon, XMarkIcon, LogoutIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from './ui/Avatar';

interface NavbarProps {
    onQuickMealClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onQuickMealClick }) => {
    const { t } = useTranslation();
    const { user, signOut } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
    const avatarMenuRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Close avatar menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
                setIsAvatarMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navItems = [
        { path: '/dashboard', label: 'dashboard' },
        { path: '/historico', label: 'history' },
        { path: '/food-analysis', label: 'food_analysis' },
        { path: '/profile', label: 'profile' },
        { path: '/settings', label: 'settings' }
    ];

    return (
        <header className="relative flex justify-between items-center px-6 lg:px-8 pt-6 lg:pt-8 border-b border-healthpal-border pb-4">
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
                            className={`py-1 text-md font-medium transition-colors ${pathname === item.path
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

                {/* Mobile menu button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 rounded-full text-healthpal-text-secondary hover:bg-healthpal-card"
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                </button>

                <Link
                    href="/settings"
                    className="p-2 rounded-full md:hidden text-healthpal-text-secondary hover:bg-healthpal-card"
                    aria-label={t('navbar.settings')}
                >
                    <SettingsIcon className="w-6 h-6" />
                </Link>
                <div className="relative" ref={avatarMenuRef}>
                    <button
                        onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                        className="hover:border-healthpal-green transition-colors"
                        aria-label="User menu"
                    >
                        <Avatar
                            name={user?.displayName || 'User'}
                            size={40}
                            className="border-2 border-healthpal-border"
                            photoURL={user?.photoURL}
                        />
                    </button>

                    {/* Avatar dropdown menu */}
                    {isAvatarMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-healthpal-panel border border-healthpal-border rounded-lg shadow-lg z-50">
                            <div className="p-3 border-b border-healthpal-border">
                                <p className="font-medium text-healthpal-text-primary truncate">{user?.displayName || 'User'}</p>
                                <p className="text-sm text-healthpal-text-secondary truncate">{user?.email}</p>
                            </div>
                            <button
                                onClick={() => {
                                    signOut();
                                    setIsAvatarMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-healthpal-text-secondary hover:text-healthpal-text-primary hover:bg-healthpal-card transition-colors rounded-b-lg"
                            >
                                <LogoutIcon className="w-5 h-5" />
                                <span>{t('navbar.logout')}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-healthpal-panel border border-healthpal-border md:hidden z-50 shadow-lg">
                    <nav className="flex flex-col p-4 space-y-2" data-testid="mobile-nav">
                        {navItems.map(item => (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`py-3 px-4 text-md font-medium transition-colors rounded-lg ${pathname === item.path
                                    ? 'text-healthpal-green bg-healthpal-card'
                                    : 'text-healthpal-text-secondary hover:text-healthpal-text-primary hover:bg-healthpal-card'
                                    }`}
                            >
                                {t(`navbar.${item.label}`)}
                            </Link>
                        ))}
                        <button
                            onClick={() => {
                                onQuickMealClick();
                                setIsMobileMenuOpen(false);
                            }}
                            className="bg-healthpal-green text-black font-bold py-3 px-4 rounded-lg hover:brightness-110 transition-all text-sm flex items-center gap-2 mt-2"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            <span>{t('navbar.quick_meal')}</span>
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Navbar;