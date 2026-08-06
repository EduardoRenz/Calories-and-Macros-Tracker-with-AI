import React from 'react';
import { AttentionPoint } from '@/domain/entities/analysis';
import { useTranslation } from '@/hooks/useTranslation';

interface AttentionPointsSectionProps {
    attentionPoints: AttentionPoint[];
}

export const AttentionPointsSection: React.FC<AttentionPointsSectionProps> = ({ attentionPoints }) => {
    const { t } = useTranslation();

    return (
        <section id="attention-points-section" className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-2">{t('food_analysis.attention.title')}</h2>
            <p className="text-neutral-text-secondary mb-4">
                {t('food_analysis.attention.subtitle')}
            </p>
            <div className="space-y-4">
                {attentionPoints.map((point, idx) => (
                    <div
                        key={idx}
                        className={`p-4 rounded-xl border-l-4 ${
                            point.severity === 'alert'
                                ? 'bg-red-500/10 border-red-500'
                                : 'bg-yellow-500/10 border-yellow-500'
                        }`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span>{point.severity === 'alert' ? '🔴' : '🟡'}</span>
                            <h3 className="font-bold">{point.title}</h3>
                        </div>
                        <p className="text-sm text-neutral-text-secondary">
                            {point.description}
                        </p>
                    </div>
                ))}
                {attentionPoints.length === 0 && (
                    <p className="text-neutral-text-secondary text-center py-4">
                        {t('food_analysis.attention.no_issues')}
                    </p>
                )}
            </div>
        </section>
    );
};
