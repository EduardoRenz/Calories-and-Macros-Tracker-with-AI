'use client';

import React from 'react';

import { DailyHistoryEntry } from '@/domain/entities/history';
import { HistoryAverages } from '@/domain/services/HistoryService';
import { HistoryCalendar } from '@/components/HistoryCalendar';
import { HistoryAveragesCard } from '@/components/HistoryAveragesCard';

export function HistorySidebar({
    calendar,
    averages,
}: {
    calendar: {
        loading: boolean;
        loadingLabel: string;
        entries: DailyHistoryEntry[];
        monthDate: Date;
        onMonthChange: (date: Date) => void;
        onDateClick: (date: string) => void;
    };
    averages: {
        loading: boolean;
        loadingLabel: string;
        data: HistoryAverages;
        daysWithEntries: number;
    };
}) {
    return (
        <div className="lg:col-span-1 grid grid-cols-1 gap-6">
            {calendar.loading ? (
                <div className="bg-neutral-card p-6 rounded-2xl flex justify-center items-center h-64 text-neutral-text-secondary">{calendar.loadingLabel}</div>
            ) : (
                <HistoryCalendar
                    entries={calendar.entries}
                    onDateClick={calendar.onDateClick}
                    monthDate={calendar.monthDate}
                    onMonthChange={calendar.onMonthChange}
                />
            )}

            {averages.loading ? (
                <div className="bg-neutral-card p-6 rounded-2xl flex justify-center items-center h-40 text-neutral-text-secondary">{averages.loadingLabel}</div>
            ) : (
                <HistoryAveragesCard averages={averages.data} daysWithEntries={averages.daysWithEntries} />
            )}
        </div>
    );
}
