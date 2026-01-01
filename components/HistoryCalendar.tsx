import React, { useMemo, useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { DailyHistoryEntry } from '@/domain/entities/history';
import { useTranslation } from '@/hooks/useTranslation';

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export function HistoryCalendar({
    entries,
    onDateClick,
    monthDate: controlledMonthDate,
    onMonthChange,
}: {
    entries: DailyHistoryEntry[];
    onDateClick: (date: string) => void;
    monthDate?: Date;
    onMonthChange?: (newMonthDate: Date) => void;
}) {
    const { t } = useTranslation();
    const [internalMonthDate, setInternalMonthDate] = useState(() => controlledMonthDate ?? new Date());

    useEffect(() => {
        if (!controlledMonthDate) return;
        setInternalMonthDate(controlledMonthDate);
    }, [controlledMonthDate]);

    const monthDate = controlledMonthDate ?? internalMonthDate;

    const byDate = useMemo(() => {
        const map = new Map<string, DailyHistoryEntry>();
        entries.forEach(e => map.set(e.date, e));
        return map;
    }, [entries]);

    const firstDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const startWeekday = firstDayOfMonth.getDay(); // 0-6
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

    const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(monthDate);

    const cells = useMemo(() => {
        const result: Array<{ key: string; day: number | null; dateStr?: string }> = [];
        for (let i = 0; i < startWeekday; i++) {
            result.push({ key: `empty-${i}`, day: null });
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const d = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
            const dateStr = formatDate(d);
            result.push({ key: dateStr, day, dateStr });
        }
        return result;
    }, [startWeekday, daysInMonth, monthDate]);

    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const goMonth = (delta: number) => {
        const base = controlledMonthDate ?? internalMonthDate;
        const next = new Date(base.getFullYear(), base.getMonth() + delta, 1);

        if (onMonthChange) {
            onMonthChange(next);
        }

        if (!controlledMonthDate) {
            setInternalMonthDate(next);
        }
    };

    return (
        <div className="bg-healthpal-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => goMonth(-1)}
                    className="p-2 rounded-md hover:bg-healthpal-border transition-colors"
                    aria-label={t('history.calendar_prev')}
                >
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <h3 className="font-bold">{monthLabel}</h3>
                <button
                    onClick={() => goMonth(1)}
                    className="p-2 rounded-md hover:bg-healthpal-border transition-colors"
                    aria-label={t('history.calendar_next')}
                >
                    <ChevronRightIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-xs text-healthpal-text-secondary mb-2">
                {weekDays.map(d => (
                    <div key={d} className="text-center">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {cells.map(cell => {
                    if (!cell.day || !cell.dateStr) {
                        return <div key={cell.key} className="h-9" />;
                    }

                    const dateStr = cell.dateStr;

                    const entry = byDate.get(cell.dateStr);
                    const hasEntry = entry?.hasEntry ?? false;
                    const isOver = hasEntry && (entry?.calories ?? 0) > (entry?.calorieGoal ?? 0);

                    const bg = hasEntry ? (isOver ? 'bg-red-500/20' : 'bg-healthpal-green/20') : 'bg-healthpal-panel/30';
                    const text = hasEntry ? (isOver ? 'text-red-500' : 'text-healthpal-green') : 'text-healthpal-text-secondary';

                    return (
                        <button
                            key={cell.key}
                            type="button"
                            onClick={() => onDateClick(dateStr)}
                            className={`h-9 rounded-lg flex items-center justify-center ${bg} ${text} font-semibold hover:brightness-110 transition-all`}
                        >
                            {cell.day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
