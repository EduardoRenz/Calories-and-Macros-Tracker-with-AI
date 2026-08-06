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
    const isVerticalOnMobile = tabs.length > 3;

    return (
        <div className="mb-8 w-full" data-testid="report-tabs-container">
            {/* Desktop View: Horizontal Tab Bar */}
            <div className="hidden md:flex bg-neutral-card p-1.5 rounded-xl border border-neutral-border gap-2 shadow-ambient w-full">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        data-testid={`tab-button-${tab.id}`}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 text-center ${
                            activeTab === tab.id
                                ? 'bg-secondary text-on-secondary shadow-md scale-[1.02]'
                                : 'text-neutral-text-secondary hover:text-neutral-text-primary hover:bg-neutral-panel'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Mobile View: Vertical or Horizontal based on tabs count */}
            {isVerticalOnMobile ? (
                // Vertical Stack of Buttons (Tabs > 3)
                <div className="flex flex-col md:hidden gap-2 w-full">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            data-testid={`tab-button-${tab.id}`}
                            className={`w-full py-3.5 px-5 rounded-xl text-left font-bold text-sm transition-all duration-200 flex items-center justify-between ${
                                activeTab === tab.id
                                    ? 'bg-secondary text-on-secondary shadow-md border border-secondary'
                                    : 'bg-neutral-card text-neutral-text-secondary border border-neutral-border hover:bg-neutral-panel'
                            }`}
                        >
                            <span>{tab.label}</span>
                            {activeTab === tab.id && (
                                <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                            )}
                        </button>
                    ))}
                </div>
            ) : (
                // Horizontal Tabs (Tabs <= 3)
                <div className="flex md:hidden bg-neutral-card p-1 rounded-xl border border-neutral-border gap-1 w-full overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            data-testid={`tab-button-${tab.id}`}
                            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all duration-200 text-center whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'bg-secondary text-on-secondary shadow-sm'
                                    : 'text-neutral-text-secondary hover:text-neutral-text-primary'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
