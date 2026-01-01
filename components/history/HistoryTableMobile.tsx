import React from 'react';
import { DailyHistoryEntry } from '@/domain/entities/history';
import { useTranslation } from '@/hooks/useTranslation';

interface HistoryTableMobileProps {
    entries: DailyHistoryEntry[];
    onDateClick: (date: string) => void;
}

export function HistoryTableMobile({ entries, onDateClick }: HistoryTableMobileProps) {
    const { t } = useTranslation();

    const formatDate = (yyyyMmDd: string) => {
        const [y, m, d] = yyyyMmDd.split('-').map(Number);
        const date = new Date(y, (m ?? 1) - 1, d ?? 1);
        return new Intl.DateTimeFormat(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
        }).format(date);
    };

    const formatNumber = (n: number) => new Intl.NumberFormat().format(n);

    return (
        <div className="px-4 py-4 flex flex-col gap-3">
            {entries.map(e => {
                const isOver = e.calories > e.calorieGoal;
                const badgeBg = isOver ? 'bg-red-500/15' : 'bg-healthpal-green/15';
                const badgeText = isOver ? 'text-red-400' : 'text-healthpal-green';

                return (
                    <button
                        key={e.date}
                        type="button"
                        onClick={() => onDateClick(e.date)}
                        data-testid={`history-entry-${e.date}`}
                        className="w-full text-left bg-healthpal-panel/50 border border-healthpal-border rounded-xl p-4 hover:bg-healthpal-panel/70 transition-colors"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="font-bold text-healthpal-text-primary truncate">{formatDate(e.date)}</p>
                                <p className="text-xs text-healthpal-text-secondary mt-0.5">
                                    {t('history.columns.calories')}: {formatNumber(e.calories)} / {formatNumber(e.calorieGoal)}
                                </p>
                            </div>
                            <div data-testid={`history-calories-${e.date}`} className={`shrink-0 px-3 py-1 rounded-lg text-sm font-bold ${badgeBg} ${badgeText}`}>
                                {formatNumber(e.calories)}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-3">
                            <div className="bg-healthpal-card border border-healthpal-border rounded-lg p-2">
                                <p className="text-[10px] uppercase tracking-wider text-healthpal-text-secondary">{t('history.columns.protein')}</p>
                                <p className="text-sm font-semibold text-healthpal-text-primary">{formatNumber(e.protein)}g</p>
                            </div>
                            <div className="bg-healthpal-card border border-healthpal-border rounded-lg p-2">
                                <p className="text-[10px] uppercase tracking-wider text-healthpal-text-secondary">{t('history.columns.carbs')}</p>
                                <p className="text-sm font-semibold text-healthpal-text-primary">{formatNumber(e.carbs)}g</p>
                            </div>
                            <div className="bg-healthpal-card border border-healthpal-border rounded-lg p-2">
                                <p className="text-[10px] uppercase tracking-wider text-healthpal-text-secondary">{t('history.columns.fats')}</p>
                                <p className="text-sm font-semibold text-healthpal-text-primary">{formatNumber(e.fats)}g</p>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
