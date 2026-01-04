'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { RepositoryFactory } from '@/data/RepositoryFactory';
import { HistoryService } from '@/domain/services/HistoryService';
import { HistoryRepository } from '@/domain/repositories/HistoryRepository';
import { useTranslation } from '@/hooks/useTranslation';
import { DailyHistoryEntry } from '@/domain/entities/history';
import { HistoryHeader, HistorySidebar, HistoryTableCard } from './_components';

export default function HistoricoPage() {
    const { t } = useTranslation();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(true);
    const [calendarLoading, setCalendarLoading] = useState(true);
    const [avgLoading, setAvgLoading] = useState(true);

    const [draftStartDate, setDraftStartDate] = useState('');
    const [draftEndDate, setDraftEndDate] = useState('');

    const [appliedStartDate, setAppliedStartDate] = useState('');
    const [appliedEndDate, setAppliedEndDate] = useState('');

    const [pageIndex, setPageIndex] = useState(0);
    const [cursors, setCursors] = useState<Array<string | null>>([null]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);

    const [tableEntries, setTableEntries] = useState<DailyHistoryEntry[]>([]);
    const [calendarEntries, setCalendarEntries] = useState<DailyHistoryEntry[]>([]);
    const [averages, setAverages] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
    const [daysWithEntries, setDaysWithEntries] = useState(0);

    const [calendarMonthDate, setCalendarMonthDate] = useState(() => new Date());

    const historyRepository: HistoryRepository = useMemo(() => RepositoryFactory.getHistoryRepository(), []);
    const historyService = useMemo(() => new HistoryService(historyRepository), [historyRepository]);

    const handleDateClick = useCallback((date: string) => {
        router.push(`/dashboard?date=${date}`);
    }, [router]);

    const fetchTablePage = useCallback(async (opts: { startDate: string; endDate: string; cursor: string | null; }) => {
        setTableLoading(true);

        const page = await historyService.getDailyHistoryPage({
            startDate: opts.startDate,
            endDate: opts.endDate,
            pageSize: 15,
            cursor: opts.cursor,
        });

        setTableEntries(page.items);
        setNextCursor(page.nextCursor);
        setTableLoading(false);
    }, [historyService]);

    const fetchCalendarMonth = useCallback(async (monthDate: Date) => {
        setCalendarLoading(true);
        const { startDate, endDate } = historyService.getMonthRange(monthDate);
        const items = await historyService.getDailyHistoryRange({ startDate, endDate });
        setCalendarEntries(items);
        setCalendarLoading(false);
    }, [historyService]);

    const fetchAverages = useCallback(async (opts: { startDate: string; endDate: string; }) => {
        setAvgLoading(true);
        const result = await historyService.getAveragesForRange({
            startDate: opts.startDate,
            endDate: opts.endDate,
        });
        setAverages(result.averages);
        setDaysWithEntries(result.daysWithEntries);
        setAvgLoading(false);
    }, [historyService]);

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            const { startDate, endDate } = historyService.getDefaultLast30DaysRange();

            setDraftStartDate(startDate);
            setDraftEndDate(endDate);
            setAppliedStartDate(startDate);
            setAppliedEndDate(endDate);

            await Promise.all([
                fetchTablePage({ startDate, endDate, cursor: null }),
                fetchAverages({ startDate, endDate }),
            ]);

            setIsLoading(false);
        };

        init();
    }, [historyService]);

    useEffect(() => {
        fetchCalendarMonth(calendarMonthDate);
    }, [calendarMonthDate]);

    const handleApply = async () => {
        if (!draftStartDate || !draftEndDate) return;

        setAppliedStartDate(draftStartDate);
        setAppliedEndDate(draftEndDate);

        setPageIndex(0);
        setCursors([null]);
        setNextCursor(null);

        await Promise.all([
            fetchTablePage({ startDate: draftStartDate, endDate: draftEndDate, cursor: null }),
            fetchAverages({ startDate: draftStartDate, endDate: draftEndDate }),
        ]);
    };

    const handleNextPage = async () => {
        if (!nextCursor) return;
        const newIndex = pageIndex + 1;
        const newCursors = [...cursors];
        newCursors[newIndex] = nextCursor;
        setCursors(newCursors);
        setPageIndex(newIndex);

        await fetchTablePage({ startDate: appliedStartDate, endDate: appliedEndDate, cursor: nextCursor });
    };

    const handlePrevPage = async () => {
        if (pageIndex === 0) return;
        const newIndex = pageIndex - 1;
        setPageIndex(newIndex);

        const cursor = cursors[newIndex] ?? null;
        await fetchTablePage({ startDate: appliedStartDate, endDate: appliedEndDate, cursor });
    };

    const handleMonthChange = async (newMonthDate: Date) => {
        setCalendarMonthDate(newMonthDate);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-96 text-healthpal-text-secondary">{t('history.loading')}</div>;
    }

    return (
        <>
            <HistoryHeader title={t('history.title')} subtitle={t('history.subtitle')} />

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <HistoryTableCard
                        title={t('history.table_title')}
                        loading={tableLoading}
                        loadingLabel={t('history.loading')}
                        entries={tableEntries}
                        onDateClick={handleDateClick}
                        filters={{
                            startDate: draftStartDate,
                            endDate: draftEndDate,
                            onStartDateChange: setDraftStartDate,
                            onEndDateChange: setDraftEndDate,
                            onApply: handleApply,
                            labels: {
                                start: t('history.filter_start'),
                                end: t('history.filter_end'),
                                apply: t('history.apply'),
                            },
                        }}
                        pagination={{
                            pageIndex,
                            hasNextPage: Boolean(nextCursor),
                            onPrevPage: handlePrevPage,
                            onNextPage: handleNextPage,
                            labels: {
                                prev: t('history.prev_page'),
                                next: t('history.next_page'),
                            },
                        }}
                    />
                </div>

                <HistorySidebar
                    calendar={{
                        loading: calendarLoading,
                        loadingLabel: t('history.loading'),
                        entries: calendarEntries,
                        monthDate: calendarMonthDate,
                        onMonthChange: handleMonthChange,
                        onDateClick: handleDateClick,
                    }}
                    averages={{
                        loading: avgLoading,
                        loadingLabel: t('history.loading'),
                        data: averages,
                        daysWithEntries,
                    }}
                />
            </main>
        </>
    );
}
