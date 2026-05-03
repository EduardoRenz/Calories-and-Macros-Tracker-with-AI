'use client';

import React from 'react';

export function HistoryFilters({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    onApply,
    labels,
}: {
    startDate: string;
    endDate: string;
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
    onApply: () => void;
    labels: {
        start: string;
        end: string;
        apply: string;
    };
}) {
    return (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="flex flex-col">
                <label className="text-xs text-neutral-text-secondary">{labels.start}</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={e => onStartDateChange(e.target.value)}
                    data-testid="history-filter-start"
                    className="bg-neutral-card border border-neutral-border rounded-lg px-3 py-2 text-sm text-neutral-text-primary"
                />
            </div>
            <div className="flex flex-col">
                <label className="text-xs text-neutral-text-secondary">{labels.end}</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={e => onEndDateChange(e.target.value)}
                    data-testid="history-filter-end"
                    className="bg-neutral-card border border-neutral-border rounded-lg px-3 py-2 text-sm text-neutral-text-primary"
                />
            </div>
            <button
                type="button"
                onClick={onApply}
                data-testid="history-filter-apply"
                className="bg-secondary text-on-secondary font-bold px-4 py-2 rounded-lg hover:brightness-110 transition-all text-sm"
            >
                {labels.apply}
            </button>
        </div>
    );
}
