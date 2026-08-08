'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { SparklesIcon, MenuIcon, XMarkIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureFlags } from '../contexts/FeatureFlagContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Avatar } from './ui/Avatar';
import { useApiKeys } from '../hooks/useApiKeys';
import { ModelImageWarningModal } from './ModelImageWarningModal';
import { ProfileDropdown } from './ProfileDropdown';

interface NavbarProps {
    onQuickMealClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onQuickMealClick }) => {
    const { t } = useTranslation();
    const { user, signOut } = useAuth();
    const { isUserApiKeysRequired } = useFeatureFlags();
    const { subscription, loading: subscriptionLoading } = useSubscription();
    const { isDeepSeekOnly, nonVisionProvider } = useApiKeys();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const avatarMenuRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const router = useRouter();

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
        <header className="relative flex justify-between items-center px-6 lg:px-8 pt-6 lg:pt-8 border-b border-neutral-border pb-4">
            <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity">
                    <Image src="/LogoHorizontal.svg" alt="LeveMente" width={200} height={64} className="h-16 w-auto" priority />
                </Link>
                <nav className="hidden md:flex items-center gap-6" data-testid="desktop-nav">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`py-1 text-md font-medium transition-colors ${pathname === item.path
                                ? 'text-brand-green border-b-2 border-brand-green'
                                : 'text-neutral-text-secondary hover:text-neutral-text-primary'
                                }`}
                        >
                            {t(`navbar.${item.label}`)}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => {
                        if (isUserApiKeysRequired) return;
                        if (isDeepSeekOnly) {
                            setShowWarningModal(true);
                            return;
                        }
                        onQuickMealClick();
                    }}
                    className={`font-bold py-2 px-4 rounded-full shadow-ambient transition-all text-sm hidden md:flex items-center gap-2 ${isUserApiKeysRequired || isDeepSeekOnly
                        ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'
                        : 'bg-secondary text-on-secondary hover:brightness-110 active:scale-95'
                        }`}
                    title={isUserApiKeysRequired ? t('dashboard.api_keys_required_title') : nonVisionProvider ? t('model_image_warning.title', { model: nonVisionProvider }) : undefined}
                >
                    <SparklesIcon className="w-5 h-5" />
                    <span>{t('navbar.quick_meal')}</span>
                </button>

                {/* Mobile menu button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 rounded-full text-neutral-text-secondary hover:bg-neutral-card"
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                </button>

                <div className="relative" ref={avatarMenuRef}>
                    <button
                        onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                        className="hover:border-brand-green transition-colors"
                        aria-label="User menu"
                        data-testid="user-menu-button"
                    >
                        <Avatar
                            name={user?.displayName || 'User'}
                            size={40}
                            className="border-2 border-neutral-border"
                            photoURL={user?.photoURL}
                        />
                    </button>

                    {/* Avatar dropdown menu */}
                    {isAvatarMenuOpen && (
                        <ProfileDropdown
                            user={user}
                            subscription={subscription}
                            subscriptionLoading={subscriptionLoading}
                            onClose={() => setIsAvatarMenuOpen(false)}
                            signOut={signOut}
                        />
                    )}
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-neutral-panel border border-neutral-border md:hidden z-50 shadow-lg">
                    <nav className="flex flex-col p-4 space-y-2" data-testid="mobile-nav">
                        {navItems.map(item => (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`py-3 px-4 text-md font-medium transition-colors rounded-lg ${pathname === item.path
                                    ? 'text-brand-green bg-neutral-card'
                                    : 'text-neutral-text-secondary hover:text-neutral-text-primary hover:bg-neutral-card'
                                    }`}
                            >
                                {t(`navbar.${item.label}`)}
                            </Link>
                        ))}
                        <button
                            onClick={() => {
                                if (isUserApiKeysRequired) return;
                                if (isDeepSeekOnly) {
                                    setShowWarningModal(true);
                                    return;
                                }
                                onQuickMealClick();
                                setIsMobileMenuOpen(false);
                            }}
                            className={`font-bold py-3 px-4 rounded-full shadow-ambient transition-all text-sm flex items-center gap-2 mt-2 ${isUserApiKeysRequired || isDeepSeekOnly
                                ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'
                                : 'bg-secondary text-on-secondary hover:brightness-110 active:scale-95'
                                }`}
                            title={isUserApiKeysRequired ? t('dashboard.api_keys_required_title') : nonVisionProvider ? t('model_image_warning.title', { model: nonVisionProvider }) : undefined}
                        >
                            <SparklesIcon className="w-5 h-5" />
                            <span>{t('navbar.quick_meal')}</span>
                        </button>
                    </nav>
                </div>
            )}

            <ModelImageWarningModal
                isOpen={showWarningModal}
                onClose={() => setShowWarningModal(false)}
                onGoToSettings={() => {
                    setShowWarningModal(false);
                    router.push('/settings');
                }}
                modelName={nonVisionProvider || 'DeepSeek'}
            />
        </header>
    );
};

export default Navbar;