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
        <div className="overflow-x-auto">
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
                        const isOver = e.hasEntry && e.calories > e.calorieGoal;
                        const calorieColor = !e.hasEntry ? 'text-healthpal-text-secondary' : isOver ? 'text-red-500' : 'text-healthpal-green';
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
                                <td className="px-6 py-4">{e.hasEntry ? `${formatNumber(e.protein)}g` : '-'}</td>
                                <td className="px-6 py-4">{e.hasEntry ? `${formatNumber(e.carbs)}g` : '-'}</td>
                                <td className="px-6 py-4">{e.hasEntry ? `${formatNumber(e.fats)}g` : '-'}</td>
                                <td className={`px-6 py-4 font-bold ${calorieColor}`}>{e.hasEntry ? formatNumber(e.calories) : '-'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
