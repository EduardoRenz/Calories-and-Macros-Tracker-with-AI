'use client';

import React from 'react';
import Link from 'next/link';

export type ProfileTabKey = 'settings' | 'food_analysis';

interface ProfileNavigationProps {
    activeTab: ProfileTabKey;
    onChangeTab: (tab: ProfileTabKey) => void;
    settingsLabel: string;
    foodAnalysisLabel: string;
}

export default function ProfileNavigation({
    activeTab,
    onChangeTab,
    settingsLabel,
    foodAnalysisLabel,
}: ProfileNavigationProps) {
    return (
        <div className="flex border-b border-healthpal-border mb-8">
            <button
                onClick={() => onChangeTab('settings')}
                className={`pb-2 px-1 mr-6 text-md font-medium ${activeTab === 'settings'
                    ? 'text-healthpal-green border-b-2 border-healthpal-green'
                    : 'text-healthpal-text-secondary'
                    }`}
            >
                {settingsLabel}
            </button>
            <Link
                href="/food-analysis"
                className={`pb-2 px-1 mr-6 text-md font-medium ${activeTab === 'food_analysis'
                    ? 'text-healthpal-green border-b-2 border-healthpal-green'
                    : 'text-healthpal-text-secondary hover:text-healthpal-text-primary'
                    }`}
            >
                {foodAnalysisLabel}
            </Link>
        </div>
    );
}
