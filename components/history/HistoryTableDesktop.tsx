import React from 'react';
import { DailyHistoryEntry } from '@/domain/entities/history';
import { useTranslation } from '@/hooks/useTranslation';

interface HistoryTableDesktopProps {
    entries: DailyHistoryEntry[];
    onDateClick: (date: string) => void;
}

export function HistoryTableDesktop({ entries, onDateClick }: HistoryTableDesktopProps) {
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
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-neutral-text-secondary">
                        <th className="px-6 py-3">{t('history.columns.date')}</th>
                        <th className="px-6 py-3 text-brand-protein">{t('history.columns.protein')}</th>
                        <th className="px-6 py-3 text-brand-carbs">{t('history.columns.carbs')}</th>
                        <th className="px-6 py-3 text-brand-fats">{t('history.columns.fats')}</th>
                        <th className="px-6 py-3 text-brand-fiber">{t('history.columns.fiber')}</th>
                        <th className="px-6 py-3">{t('history.columns.calories')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-border/20">
                    {entries.map(e => {
                        const isOver = e.calories > e.calorieGoal;
                        const calorieColor = isOver ? 'text-red-500' : 'text-brand-green';

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
                            <tr key={e.date} className="hover:bg-neutral-panel/30 transition-colors">
                                <td className="px-6 py-4 font-medium">
                                    <button
                                        type="button"
                                        onClick={() => onDateClick(e.date)}
                                        data-testid={`history-entry-${e.date}`}
                                        className="text-left hover:underline"
                                    >
                                        {formatDate(e.date)}
                                    </button>
                                </td>
                                <td className={`px-6 py-4 ${proteinMet ? 'text-brand-protein' : 'text-neutral-text-primary'}`}>{`${formatNumber(e.protein)}g`}</td>
                                <td className={`px-6 py-4 ${carbsMet ? 'text-brand-carbs' : 'text-neutral-text-primary'}`}>{`${formatNumber(e.carbs)}g`}</td>
                                <td className={`px-6 py-4 ${fatsMet ? 'text-brand-fats' : 'text-neutral-text-primary'}`}>{`${formatNumber(e.fats)}g`}</td>
                                <td className={`px-6 py-4 ${fiberMet ? 'text-brand-fiber' : 'text-neutral-text-primary'}`}>{`${formatNumber(e.fiber)}g`}</td>
                                <td className={`px-6 py-4 font-bold ${calorieColor}`}>{formatNumber(e.calories)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
