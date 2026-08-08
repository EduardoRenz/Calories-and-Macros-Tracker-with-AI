import React from 'react';

interface TabItem {
    id: string;
    label: string;
}

interface ReportTabsProps {
    tabs: readonly TabItem[] | TabItem[];
    activeTab: string;
    setActiveTab: (id: string) => void;
}

export const ReportTabs: React.FC<ReportTabsProps> = ({
    tabs,
    activeTab,
    setActiveTab,
}) => {
    return (
        <div
            className="w-full overflow-x-auto scrollbar-hide -mx-1 px-1"
            data-testid="report-tabs-container"
        >
            <div className="inline-flex w-full min-w-max bg-neutral-card p-1.5 rounded-xl border border-neutral-border gap-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        data-testid={`tab-button-${tab.id}`}
                        className={`flex-1 py-2 px-3 md:py-2.5 md:px-4 text-xs md:text-sm font-semibold transition-all duration-200 text-center whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'bg-brand-green/15 text-brand-green shadow-sm'
                                : 'text-neutral-text-secondary hover:text-neutral-text-primary hover:bg-neutral-panel'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
