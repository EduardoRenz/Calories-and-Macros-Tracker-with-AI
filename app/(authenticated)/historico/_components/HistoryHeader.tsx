'use client';

import React from 'react';

export function HistoryHeader({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center my-8 gap-4">
            <div>
                <h2 className="text-3xl font-bold">{title}</h2>
                <p className="text-healthpal-text-secondary mt-1">{subtitle}</p>
            </div>
        </section>
    );
}
