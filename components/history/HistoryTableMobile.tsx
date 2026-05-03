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
                const badgeBg = isOver ? 'bg-red-500/15' : 'bg-brand-green/15';
                const badgeText = isOver ? 'text-red-400' : 'text-brand-green';

                // Calculate macro goals
                const proteinGoal = Math.round((e.calorieGoal * 0.30) / 4);
                const carbsGoal = Math.round((e.calorieGoal * 0.40) / 4);
                const fatsGoal = Math.round((e.calorieGoal * 0.30) / 9);
                const fiberGoal = 25; // Standard daily fiber recommendation

                // Check if goals are met
                const proteinMet = e.protein >= proteinGoal;
                const carbsMet = e.carbs >= carbsGoal;
                const fatsMet = e.fats >= fatsGoal;
                const fiberMet = e.fiber >= fiberGoal;

                return (
                    <button
                        key={e.date}
                        type="button"
                        onClick={() => onDateClick(e.date)}
                        data-testid={`history-entry-${e.date}`}
                        className="w-full text-left bg-neutral-panel/50 border border-neutral-border rounded-xl p-4 hover:bg-neutral-panel/70 transition-colors"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="font-bold text-neutral-text-primary truncate">{formatDate(e.date)}</p>
                                <p className="text-xs text-neutral-text-secondary mt-0.5">
                                    {t('history.columns.calories')}: {formatNumber(e.calories)} / {formatNumber(e.calorieGoal)}
                                </p>
                            </div>
                            <div data-testid={`history-calories-${e.date}`} className={`shrink-0 px-3 py-1 rounded-lg text-sm font-bold ${badgeBg} ${badgeText}`}>
                                {formatNumber(e.calories)}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5 mt-3">
                            <div className="bg-neutral-panel border border-neutral-border rounded-lg p-1.5 text-center">
                                <p className="text-[9px] uppercase text-brand-protein font-medium opacity-80 truncate">{t('history.columns.protein')}</p>
                                <p className="text-xs font-bold text-brand-protein">{formatNumber(e.protein)}g</p>
                            </div>
                            <div className="bg-neutral-panel border border-neutral-border rounded-lg p-1.5 text-center">
                                <p className="text-[9px] uppercase text-brand-carbs font-medium opacity-80 truncate">{t('history.columns.carbs')}</p>
                                <p className="text-xs font-bold text-brand-carbs">{formatNumber(e.carbs)}g</p>
                            </div>
                            <div className="bg-neutral-panel border border-neutral-border rounded-lg p-1.5 text-center">
                                <p className="text-[9px] uppercase text-brand-fats font-medium opacity-80 truncate">{t('history.columns.fats')}</p>
                                <p className="text-xs font-bold text-brand-fats">{formatNumber(e.fats)}g</p>
                            </div>
                            <div className="bg-neutral-panel border border-neutral-border rounded-lg p-1.5 text-center">
                                <p className="text-[9px] uppercase text-brand-fiber font-medium opacity-80 truncate">{t('history.columns.fiber')}</p>
                                <p className="text-xs font-bold text-brand-fiber">{formatNumber(e.fiber)}g</p>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
