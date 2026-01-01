import React, { useMemo } from 'react';
import { DailyHistoryEntry } from '@/domain/entities/history';
import { HistoryTableMobile, HistoryTableDesktop } from './history';
import { useBreakpoint } from '@/hooks/useBreakpoint';


export function HistoryTable({ entries, onDateClick }: { entries: DailyHistoryEntry[]; onDateClick: (date: string) => void; }) {
    const rows = useMemo(() => entries.filter(e => e.hasEntry), [entries]);
    const isMobile = useBreakpoint('md');

    if (isMobile) {
        return <HistoryTableMobile entries={rows} onDateClick={onDateClick} />;
    }

    return <HistoryTableDesktop entries={rows} onDateClick={onDateClick} />;
}
