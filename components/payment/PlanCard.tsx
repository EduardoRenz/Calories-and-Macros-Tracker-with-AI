import React from 'react';
import { Plan } from '../../domain/entities/payment';
import { useTranslation } from '../../hooks/useTranslation';
import { BILLING_CONSTANTS } from '../../domain/constants/billing';
import { Button } from '../ui/Button';

interface PlanCardProps {
    plan: Plan;
    onSelect: (plan: Plan) => void;
    isLoading?: boolean;
    isCurrentPlan?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect, isLoading = false, isCurrentPlan = false }) => {
    const { t, to } = useTranslation();
    const isPopular = plan.isPopular;
    const isFree = plan.id === 'free' || plan.price === 0;
    const isMemberPlan = !isFree;
    const shouldUseGreenStyle = isPopular || isMemberPlan;

    // Direct mapping: plans.features.free, plans.features.member_monthly, etc.
    const planData = to(`plans.features.${plan.id}`) as { features?: Array<{ included: boolean; text: string }>; discount_message?: string } | Array<{ included: boolean; text: string }>;
    const featuresToDisplay = (Array.isArray(planData) ? planData : planData?.features) || plan.features;

    // Use t with interpolation for the discount message if it exists in locales
    const discountMessage = (!Array.isArray(planData) && planData?.discount_message)
        ? t(`plans.features.${plan.id}.discount_message`, { percentage: BILLING_CONSTANTS.ANNUAL_DISCOUNT_PERCENTAGE })
        : plan.discountMessage;

    // Calculate original price automatically: Current Price + Percentage
    const originalPrice = plan.id === BILLING_CONSTANTS.PLAN_CODES.MEMBER_ANNUAL
        ? plan.price * (1 + (BILLING_CONSTANTS.ANNUAL_DISCOUNT_PERCENTAGE / 100))
        : plan.originalPrice;

    const originalPriceLabel = originalPrice ? plan.currency.format(originalPrice) : null;

    return (
        <div
            className={`relative flex flex-col rounded-2xl border p-6 shadow-ambient transition-all hover:scale-[1.02] bg-neutral-card ${shouldUseGreenStyle
                ? 'border-secondary'
                : 'border-neutral-border'
                }`}
        >
            {(isPopular || discountMessage) && (
                <div className="absolute -top-3 right-4 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-on-secondary shadow-lg">
                    {discountMessage || t('plans.popular')}
                </div>
            )}

            <div className="mb-4">
                <h3 className={`text-lg font-semibold ${shouldUseGreenStyle ? 'text-primary' : 'text-neutral-text-primary'}`}>
                    {plan.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-neutral-text-primary">
                        {plan.formattedPrice}
                    </span>
                    {originalPriceLabel && (
                        <span className="text-sm text-neutral-text-secondary/60 line-through">
                            {originalPriceLabel}
                        </span>
                    )}
                    <span className="text-sm text-neutral-text-secondary">/{plan.interval}</span>
                </div>
                {plan.description && (
                    <p className="mt-2 text-sm text-neutral-text-secondary">{plan.description}</p>
                )}
            </div>

            <ul className="mb-8 flex-1 space-y-3">
                {featuresToDisplay.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                        {feature.included ? (
                            <svg
                                className="h-5 w-5 shrink-0 text-secondary"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg
                                className="h-5 w-5 shrink-0 text-neutral-text-secondary/40"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        )}
                        <span className={`text-sm ${feature.included ? 'text-neutral-text-primary' : 'text-neutral-text-secondary/50 line-through'}`}>
                            {feature.text}
                        </span>
                    </li>
                ))}
            </ul>

            <Button
                onClick={() => onSelect(plan)}
                disabled={isLoading || isCurrentPlan}
                variant={shouldUseGreenStyle ? 'secondary' : 'outline'}
                fullWidth
                isLoading={isLoading}
            >
                {isCurrentPlan
                    ? (plan.currency.code === 'BRL' ? 'Plano Atual' : 'Current Plan')
                    : shouldUseGreenStyle
                        ? (plan.currency.code === 'BRL' ? 'Atualizar para Membro' : 'Upgrade to Member')
                        : (plan.currency.code === 'BRL' ? 'Começar' : 'Get Started')
                }
            </Button>
        </div>
    );
};
