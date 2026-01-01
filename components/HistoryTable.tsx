import React, { useMemo } from 'react';
import { DailyHistoryEntry } from '@/domain/entities/history';
import { useTranslation } from '@/hooks/useTranslation';

export function HistoryTable({ entries, onDateClick }: { entries: DailyHistoryEntry[]; onDateClick: (date: string) => void; }) {
    const { t } = useTranslation();

    const rows = useMemo(() => entries.filter(e => e.hasEntry), [entries]);

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
        <>
            <div className="md:hidden px-4 py-4 flex flex-col gap-3">
                {rows.map(e => {
                    const isOver = e.calories > e.calorieGoal;
                    const badgeBg = isOver ? 'bg-red-500/15' : 'bg-healthpal-green/15';
                    const badgeText = isOver ? 'text-red-400' : 'text-healthpal-green';

                    return (
                        <button
                            key={e.date}
                            type="button"
                            onClick={() => onDateClick(e.date)}
                            className="w-full text-left bg-healthpal-panel/50 border border-healthpal-border rounded-xl p-4 hover:bg-healthpal-panel/70 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-bold text-healthpal-text-primary truncate">{formatDate(e.date)}</p>
                                    <p className="text-xs text-healthpal-text-secondary mt-0.5">
                                        {t('history.columns.calories')}: {formatNumber(e.calories)} / {formatNumber(e.calorieGoal)}
                                    </p>
                                </div>
                                <div className={`shrink-0 px-3 py-1 rounded-lg text-sm font-bold ${badgeBg} ${badgeText}`}>
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

            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-xs uppercase tracking-wider text-healthpal-text-secondary">
                            <th className="px-6 py-3">{t('history.columns.date')}</th>
                            <th className="px-6 py-3">{t('history.columns.protein')}</th>
                            <th className="px-6 py-3">{t('history.columns.carbs')}</th>
                            <th className="px-6 py-3">{t('history.columns.fats')}</th>
                            <th className="px-6 py-3">{t('history.columns.calories')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-healthpal-border/20">
                        {rows.map(e => {
                            const isOver = e.calories > e.calorieGoal;
                            const calorieColor = isOver ? 'text-red-500' : 'text-healthpal-green';
                            return (
                                <tr key={e.date} className="hover:bg-healthpal-panel/30 transition-colors">
                                    <td className="px-6 py-4 font-medium">
                                        <button
                                            type="button"
                                            onClick={() => onDateClick(e.date)}
                                            className="text-left hover:underline"
                                        >
                                            {formatDate(e.date)}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">{`${formatNumber(e.protein)}g`}</td>
                                    <td className="px-6 py-4">{`${formatNumber(e.carbs)}g`}</td>
                                    <td className="px-6 py-4">{`${formatNumber(e.fats)}g`}</td>
                                    <td className={`px-6 py-4 font-bold ${calorieColor}`}>{formatNumber(e.calories)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}
