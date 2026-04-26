import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { HistoryAverages } from '@/domain/services/HistoryService';

export function HistoryAveragesCard({ averages, daysWithEntries }: { averages: HistoryAverages; daysWithEntries: number }) {
    const { t } = useTranslation();
    const formatNumber = (n: number) => new Intl.NumberFormat().format(n);

    return (
        <div className="bg-healthpal-card p-6 rounded-2xl">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold">{t('history.averages_title')}</h3>
                    <p className="text-healthpal-text-secondary text-sm mt-1">
                        {t('history.averages_subtitle')} {daysWithEntries}
                    </p>
                </div>
            </div>

            <div className="mt-6 space-y-3">
                <div className="flex justify-between">
                    <span className="text-healthpal-text-secondary">{t('history.columns.calories')}</span>
                    <span className="font-bold text-healthpal-text-primary">{formatNumber(averages.calories)} kcal</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-healthpal-text-secondary">{t('history.columns.protein')}</span>
                    <span className="font-bold text-healthpal-text-primary">{formatNumber(averages.protein)} g</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-healthpal-text-secondary">{t('history.columns.carbs')}</span>
                    <span className="font-bold text-healthpal-text-primary">{formatNumber(averages.carbs)} g</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-healthpal-text-secondary">{t('history.columns.fats')}</span>
                    <span className="font-bold text-healthpal-text-primary">{formatNumber(averages.fats)} g</span>
                </div>
            </div>
        </div>
    );
}
