'use client';

import React from 'react';

import { DailyHistoryEntry } from '@/domain/entities/history';
import { HistoryTable } from '@/components/HistoryTable';
import { HistoryFilters } from './HistoryFilters';

export function HistoryTableCard({
    title,
    loading,
    loadingLabel,
    entries,
    onDateClick,
    filters,
    pagination,
}: {
    title: string;
    loading: boolean;
    loadingLabel: string;
    entries: DailyHistoryEntry[];
    onDateClick: (date: string) => void;
    filters: {
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
    };
    pagination: {
        pageIndex: number;
        hasNextPage: boolean;
        onPrevPage: () => void;
        onNextPage: () => void;
        labels: {
            prev: string;
            next: string;
        };
    };
}) {
    return (
        <div className="bg-neutral-card rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-border">
                <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                    <div>
                        <h3 className="text-xl font-bold">{title}</h3>
                    </div>

                    <HistoryFilters
                        startDate={filters.startDate}
                        endDate={filters.endDate}
                        onStartDateChange={filters.onStartDateChange}
                        onEndDateChange={filters.onEndDateChange}
                        onApply={filters.onApply}
                        labels={filters.labels}
                    />
                </div>
            </div>

            <div className="p-0">
                {loading ? (
                    <div className="flex justify-center items-center h-64 text-neutral-text-secondary">{loadingLabel}</div>
                ) : (
                    <>
                        <HistoryTable entries={entries} onDateClick={onDateClick} />
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-4 sm:px-6 py-4 border-t border-neutral-border">
                            <button
                                type="button"
                                onClick={pagination.onPrevPage}
                                disabled={pagination.pageIndex === 0}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-neutral-panel/40 border border-neutral-border text-sm disabled:opacity-50"
                            >
                                {pagination.labels.prev}
                            </button>
                            <span className="text-sm text-neutral-text-secondary text-center">{pagination.pageIndex + 1}</span>
                            <button
                                type="button"
                                onClick={pagination.onNextPage}
                                disabled={!pagination.hasNextPage}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-neutral-panel/40 border border-neutral-border text-sm disabled:opacity-50"
                            >
                                {pagination.labels.next}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
