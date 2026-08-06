import React from 'react';
import { VitaminAnalysis, VitaminStatus } from '@/domain/entities/analysis';
import { useTranslation } from '@/hooks/useTranslation';

interface VitaminsSectionProps {
    vitamins: VitaminAnalysis[];
}

const VitaminStatusBadge: React.FC<{ status: VitaminStatus }> = ({ status }) => {
    const colors = {
        good: { emoji: '🟢' },
        low: { emoji: '🟡' },
        deficient: { emoji: '🔴' }
    };
    const style = colors[status];
    return <span className="text-2xl">{style.emoji}</span>;
};

export const VitaminsSection: React.FC<VitaminsSectionProps> = ({ vitamins }) => {
    const { t } = useTranslation();

    const sufficientVitamins = vitamins.filter(v => v.status === 'good' || v.status === 'low');
    const deficientVitamins = vitamins.filter(v => v.status === 'deficient');

    return (
        <section id="vitamins-section" className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-2">{t('food_analysis.vitamins.title')}</h2>
            <p className="text-neutral-text-secondary mb-4">
                {t('food_analysis.vitamins.subtitle')}
            </p>

            <div className="space-y-6">
                {/* Sufficient & Moderate Group */}
                {sufficientVitamins.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-neutral-text-secondary uppercase mb-3">
                            {t('food_analysis.vitamins.sufficient_moderate')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {sufficientVitamins.map((vitamin, idx) => (
                                <div
                                    key={idx}
                                    className="bg-neutral-card p-5 rounded-2xl"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-3xl">{vitamin.emoji || '💊'}</span>
                                        <div className="min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-bold">{vitamin.name}</p>
                                                <VitaminStatusBadge status={vitamin.status} />
                                            </div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className={`w-2 h-2 rounded-full ${vitamin.status === 'good' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                                <span className={`text-xs uppercase ${vitamin.status === 'good' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                    {t(`food_analysis.vitamins.status.${vitamin.status}`)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {vitamin.positiveReason && (
                                        <div className="mt-3 pt-3 border-t border-neutral-border">
                                            <p className="text-xs text-neutral-text-secondary uppercase mb-2">
                                                {t('food_analysis.vitamins.positive_reason')}:
                                            </p>
                                            <p className="text-sm text-neutral-text-secondary">
                                                {vitamin.positiveReason}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Deficient - Needs Action Group */}
                {deficientVitamins.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-red-400 uppercase mb-3">
                            {t('food_analysis.vitamins.deficient_action')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {deficientVitamins.map((vitamin, idx) => (
                                <div
                                    key={idx}
                                    className="bg-neutral-card p-5 rounded-2xl border border-red-500/30"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-3xl">{vitamin.emoji || '💊'}</span>
                                        <div>
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-bold">{vitamin.name}</p>
                                                <VitaminStatusBadge status={vitamin.status} />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                                <span className="text-xs text-red-400 uppercase">
                                                    {t('food_analysis.vitamins.status.deficient')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {vitamin.recommendations && vitamin.recommendations.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-neutral-border">
                                            <p className="text-xs text-neutral-text-secondary uppercase mb-2">
                                                {t('food_analysis.vitamins.recommendations')}:
                                            </p>
                                            <ul className="space-y-1">
                                                {vitamin.recommendations.map((rec, recIdx) => (
                                                    <li key={recIdx} className="flex items-start gap-2 text-sm text-neutral-text-secondary">
                                                        <span className="text-green-400">✓</span>
                                                        <span>{rec}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};
