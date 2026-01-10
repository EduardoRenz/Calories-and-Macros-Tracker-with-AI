import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';

interface DashboardNavigationProps {
    currentDate: Date;
    isToday: boolean;
    displayDate: string;
    onDateChange: (days: number) => void;
    onGoToToday: () => void;
    todayLabel: string;
    title: string;
}

export default function DashboardNavigation({
    currentDate,
    isToday,
    displayDate,
    onDateChange,
    onGoToToday,
    todayLabel,
    title,
}: DashboardNavigationProps) {
    return (
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center my-8 gap-4">
            <div>
                <h2 className="text-3xl font-bold">{title}</h2>
                <p className="text-healthpal-text-secondary mt-1">{displayDate}</p>
            </div>
            <div className="flex items-center gap-2">
                {!isToday && (
                    <button
                        onClick={onGoToToday}
                        className="bg-healthpal-card text-healthpal-text-primary font-bold py-2 px-4 rounded-lg hover:bg-healthpal-border transition-all"
                    >
                        {todayLabel}
                    </button>
                )}
                <button
                    onClick={() => onDateChange(-1)}
                    className="p-2 bg-healthpal-card rounded-md hover:bg-healthpal-border transition-colors"
                >
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                    onClick={() => onDateChange(1)}
                    className="p-2 bg-healthpal-card rounded-md hover:bg-healthpal-border transition-colors"
                >
                    <ChevronRightIcon className="h-5 w-5" />
                </button>
            </div>
        </section>
    );
}
