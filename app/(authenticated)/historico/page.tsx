'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { RepositoryFactory } from '@/data/RepositoryFactory';
import { HistoryService } from '@/domain/services/HistoryService';
import { HistoryRepository } from '@/domain/repositories/HistoryRepository';
import { useTranslation } from '@/hooks/useTranslation';
import { HistoryTable } from '@/components/HistoryTable';
import { HistoryCalendar } from '@/components/HistoryCalendar';
import { HistoryAveragesCard } from '@/components/HistoryAveragesCard';
import { DailyHistoryEntry } from '@/domain/entities/history';

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
    }, [historyService, fetchTablePage, fetchAverages]);

    useEffect(() => {
        fetchCalendarMonth(calendarMonthDate);
    }, [calendarMonthDate, fetchCalendarMonth]);

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
            <section className="flex flex-col md:flex-row justify-between items-start md:items-center my-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold">{t('history.title')}</h2>
                    <p className="text-healthpal-text-secondary mt-1">{t('history.subtitle')}</p>
                </div>
            </section>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-healthpal-card rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-healthpal-border">
                            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                                <div>
                                    <h3 className="text-xl font-bold">{t('history.table_title')}</h3>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                                    <div className="flex flex-col">
                                        <label className="text-xs text-healthpal-text-secondary">{t('history.filter_start')}</label>
                                        <input
                                            type="date"
                                            value={draftStartDate}
                                            onChange={e => setDraftStartDate(e.target.value)}
                                            className="bg-healthpal-card border border-healthpal-border rounded-lg px-3 py-2 text-sm text-healthpal-text-primary"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-xs text-healthpal-text-secondary">{t('history.filter_end')}</label>
                                        <input
                                            type="date"
                                            value={draftEndDate}
                                            onChange={e => setDraftEndDate(e.target.value)}
                                            className="bg-healthpal-card border border-healthpal-border rounded-lg px-3 py-2 text-sm text-healthpal-text-primary"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleApply}
                                        className="bg-healthpal-green text-black font-bold px-4 py-2 rounded-lg hover:brightness-110 transition-all text-sm"
                                    >
                                        {t('history.apply')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-0">
                            {tableLoading ? (
                                <div className="flex justify-center items-center h-64 text-healthpal-text-secondary">{t('history.loading')}</div>
                            ) : (
                                <>
                                    <HistoryTable entries={tableEntries} onDateClick={handleDateClick} />
                                    <div className="flex justify-between items-center px-6 py-4 border-t border-healthpal-border">
                                        <button
                                            type="button"
                                            onClick={handlePrevPage}
                                            disabled={pageIndex === 0}
                                            className="px-4 py-2 rounded-lg bg-healthpal-panel/40 border border-healthpal-border text-sm disabled:opacity-50"
                                        >
                                            {t('history.prev_page')}
                                        </button>
                                        <span className="text-sm text-healthpal-text-secondary">{pageIndex + 1}</span>
                                        <button
                                            type="button"
                                            onClick={handleNextPage}
                                            disabled={!nextCursor}
                                            className="px-4 py-2 rounded-lg bg-healthpal-panel/40 border border-healthpal-border text-sm disabled:opacity-50"
                                        >
                                            {t('history.next_page')}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 grid grid-cols-1 gap-6">
                    {calendarLoading ? (
                        <div className="bg-healthpal-card p-6 rounded-2xl flex justify-center items-center h-64 text-healthpal-text-secondary">{t('history.loading')}</div>
                    ) : (
                        <HistoryCalendar
                            entries={calendarEntries}
                            onDateClick={handleDateClick}
                            monthDate={calendarMonthDate}
                            onMonthChange={handleMonthChange}
                        />
                    )}

                    {avgLoading ? (
                        <div className="bg-healthpal-card p-6 rounded-2xl flex justify-center items-center h-40 text-healthpal-text-secondary">{t('history.loading')}</div>
                    ) : (
                        <HistoryAveragesCard averages={averages} daysWithEntries={daysWithEntries} />
                    )}
                </div>
            </main>
        </>
    );
}
