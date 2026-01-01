'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { RepositoryFactory } from '@/data/RepositoryFactory';
import { HistoryService, HistoryResult } from '@/domain/services/HistoryService';
import { HistoryRepository } from '@/domain/repositories/HistoryRepository';
import { useTranslation } from '@/hooks/useTranslation';
import { HistoryTable } from '@/components/HistoryTable';
import { HistoryCalendar } from '@/components/HistoryCalendar';
import { HistoryAveragesCard } from '@/components/HistoryAveragesCard';

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function HistoricoPage() {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const [result, setResult] = useState<HistoryResult | null>(null);

    const historyRepository: HistoryRepository = useMemo(() => RepositoryFactory.getHistoryRepository(), []);
    const historyService = useMemo(() => new HistoryService(historyRepository), [historyRepository]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 29);

            const data = await historyService.getDailyHistoryWithGaps({
                startDate: formatDate(start),
                endDate: formatDate(end),
            });

            setResult(data);
            setIsLoading(false);
        };

        fetchData();
    }, [historyService]);

    if (isLoading || !result) {
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
                    <HistoryTable entries={result.entries} />
                </div>

                <div className="lg:col-span-1 grid grid-cols-1 gap-6">
                    <HistoryCalendar entries={result.entries} />
                    <HistoryAveragesCard averages={result.averages} daysWithEntries={result.daysWithEntries} />
                </div>
            </main>
        </>
    );
}
