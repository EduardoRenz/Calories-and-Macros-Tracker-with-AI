'use client';

import React from 'react';
import Link from 'next/link';
import { UserIcon, SettingsIcon, LogoutIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import { Subscription } from '../domain/entities/subscription';

interface ProfileDropdownProps {
    user: {
        displayName?: string | null;
        email?: string | null;
        photoURL?: string | null;
    } | null;
    subscription: Subscription | null;
    subscriptionLoading: boolean;
    onClose: () => void;
    signOut: () => void;
}

/**
 * Premium Profile Dropdown component that appears when clicking the user avatar.
 * Extracted from Navbar for better maintainability and cleaner code.
 */
export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
    user,
    subscription,
    subscriptionLoading,
    onClose,
    signOut
}) => {
    const { t } = useTranslation();

    const getTrialDaysRemaining = (sub: Subscription | null): number => {
        if (!sub || !sub.currentPeriodEnd) return 0;
        const now = new Date();
        const end = new Date(sub.currentPeriodEnd);
        const diffMs = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    return (
        <div className="absolute right-0 top-full mt-3 w-72 bg-neutral-panel border border-neutral-border rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 ring-1 ring-black/5">
            {/* User Header Section */}
            <div className="p-5 border-b border-neutral-border bg-gradient-to-br from-neutral-card/80 to-neutral-panel/50">
                <p className="font-bold text-neutral-text-primary truncate text-lg tracking-tight">
                    {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-neutral-text-secondary truncate mt-0.5 opacity-80">
                    {user?.email}
                </p>
                
                {!subscriptionLoading && subscription && (
                    <div className="mt-4">
                        {subscription.isTrial ? (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 shadow-sm">
                                {t('settings.subscription.plan_trial')} • {getTrialDaysRemaining(subscription)}d
                            </span>
                        ) : (
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                                subscription.isFree
                                    ? 'bg-neutral-border/50 text-neutral-text-secondary border border-neutral-border'
                                    : 'bg-secondary/10 text-brand-green border border-brand-green/20'
                            }`}>
                                {subscription.isFree ? t('settings.subscription.plan_free') : t('settings.subscription.plan_premium')}
                            </span>
                        )}
                    </div>
                )}
            </div>
            
            {/* Settings Section (Theme & Language) */}
            <div className="py-2 bg-neutral-panel/30">
                <ThemeSwitcher />
                <LanguageSwitcher />
            </div>

            {/* Actions Section */}
            <div className="p-3 bg-neutral-panel">
                <Link
                    href="/profile"
                    onClick={onClose}
                    className="group w-full flex items-center gap-4 px-4 py-3 text-sm font-semibold text-neutral-text-secondary hover:text-neutral-text-primary hover:bg-neutral-card transition-all rounded-2xl border border-transparent hover:border-neutral-border"
                    data-testid="profile-link"
                >
                    <div className="w-10 h-10 rounded-xl bg-neutral-card group-hover:bg-neutral-panel flex items-center justify-center border border-neutral-border transition-colors shadow-sm">
                        <UserIcon className="w-5 h-5 text-brand-green" />
                    </div>
                    <span className="flex-1 text-left">{t('navbar.profile')}</span>
                </Link>

                <Link
                    href="/settings"
                    onClick={onClose}
                    className="group w-full flex items-center gap-4 px-4 py-3 text-sm font-semibold text-neutral-text-secondary hover:text-neutral-text-primary hover:bg-neutral-card transition-all rounded-2xl border border-transparent hover:border-neutral-border mt-2"
                    data-testid="settings-link"
                >
                    <div className="w-10 h-10 rounded-xl bg-neutral-card group-hover:bg-neutral-panel flex items-center justify-center border border-neutral-border transition-colors shadow-sm">
                        <SettingsIcon className="w-5 h-5 text-brand-green" />
                    </div>
                    <span className="flex-1 text-left">{t('navbar.settings')}</span>
                </Link>
                
                <button
                    onClick={() => {
                        signOut();
                        onClose();
                    }}
                    className="group w-full flex items-center gap-4 px-4 py-3 text-sm font-semibold text-red-500/80 hover:text-red-500 hover:bg-red-500/5 transition-all rounded-2xl mt-2 border border-transparent hover:border-red-500/10"
                >
                    <div className="w-10 h-10 rounded-xl bg-red-500/5 group-hover:bg-red-500/10 flex items-center justify-center border border-red-500/10 transition-colors shadow-sm">
                        <LogoutIcon className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-left">{t('navbar.logout')}</span>
                </button>
            </div>
        </div>
    );
};
