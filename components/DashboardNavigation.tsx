import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';

interface DashboardNavigationProps {
    isToday: boolean;
    displayDate: string;
    onDateChange: (days: number) => void;
    onGoToToday: () => void;
    todayLabel: string;
    title?: string;
}

export default function DashboardNavigation({
    isToday,
    displayDate,
    onDateChange,
    onGoToToday,
    todayLabel,
    title,
}: DashboardNavigationProps) {
    return (
        <section className="flex flex-col my-8 gap-4">
            {title && <h2 className="text-3xl font-bold">{title}</h2>}

            {/* Mobile layout: arrows inline with date */}
            <div className="flex md:hidden items-center justify-between gap-2">
                <button
                    onClick={() => onDateChange(-1)}
                    className="p-2 bg-healthpal-card rounded-md hover:bg-healthpal-border transition-colors"
                >
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <p className="text-healthpal-text-secondary flex-1 text-center">{displayDate}</p>
                <button
                    onClick={() => onDateChange(1)}
                    className="p-2 bg-healthpal-card rounded-md hover:bg-healthpal-border transition-colors"
                >
                    <ChevronRightIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Desktop layout: date on left, arrows on right */}
            <div className="hidden md:flex justify-between items-center">
                <p className="text-healthpal-text-secondary">{displayDate}</p>
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
            </div>

            {/* Mobile: today button below navigation */}
            {!isToday && (
                <button
                    onClick={onGoToToday}
                    className="md:hidden bg-healthpal-card text-healthpal-text-primary font-bold py-2 px-4 rounded-lg hover:bg-healthpal-border transition-all w-full"
                >
                    {todayLabel}
                </button>
            )}
        </section>
    );
}
