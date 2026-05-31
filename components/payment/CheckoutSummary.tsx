import React from 'react';
import { Plan } from '../../domain/entities/payment';
import { useTranslation } from '../../hooks/useTranslation';
import { BILLING_CONSTANTS } from '../../domain/constants/billing';

interface OrderSummaryProps {
    plan: Plan;
    taxRate?: number; // 0.0 for now as per screenshot
}

export const CheckoutSummary: React.FC<OrderSummaryProps> = ({ plan, taxRate = 0 }) => {
    const { t } = useTranslation();

    // Use Plan value object methods for calculations
    const totalDue = plan.price;

    // Calculate subtotal (original price) automatically for annual plans
    let subtotal = totalDue;
    if (plan.id === BILLING_CONSTANTS.PLAN_CODES.MEMBER_ANNUAL) {
        subtotal = totalDue / (1 - (BILLING_CONSTANTS.ANNUAL_DISCOUNT_PERCENTAGE / 100));
    } else if (plan.hasDiscount && plan.originalPrice) {
        subtotal = plan.originalPrice;
    }

    const discountAmount = subtotal - totalDue;

    const displayDiscountPercentage = plan.discountPercentage || (plan.id === BILLING_CONSTANTS.PLAN_CODES.MEMBER_ANNUAL ? BILLING_CONSTANTS.ANNUAL_DISCOUNT_PERCENTAGE : (subtotal > totalDue ? Math.round(((subtotal - totalDue) / subtotal) * 100) : 0));

    return (
        <div className="rounded-2xl border border-neutral-border bg-neutral-panel/50 p-6">
            <h2 className="mb-6 text-xl font-semibold text-neutral-text-primary">{t('checkout.order_summary')}</h2>

            <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {/* Icon */}
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                </div>
                <div>
                    <h3 className="font-semibold text-neutral-text-primary">{plan.name}</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-text-secondary">
                            {plan.description?.split('.')[0] || `Billed ${plan.interval === 'year' ? 'annually' : 'monthly'}`}
                        </span>
                        {displayDiscountPercentage > 0 && (
                            <span className="rounded bg-secondary/20 px-1.5 py-0.5 text-[10px] font-bold text-secondary">
                                -{displayDiscountPercentage}%
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mb-6 space-y-3 border-t border-neutral-border pt-6">
                <div className="flex justify-between text-sm">
                    <span className="text-neutral-text-secondary">{t('checkout.subtotal')}</span>
                    <span className="text-neutral-text-primary">{plan.currency.format(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-secondary">{t('checkout.annual_discount')}</span>
                        <span className="text-secondary">-{plan.currency.format(discountAmount)}</span>
                    </div>
                )}
                <div className="flex justify-between text-sm">
                    <span className="text-neutral-text-secondary">{t('checkout.tax')} ({taxRate}%)</span>
                    <span className="text-neutral-text-primary">{plan.currency.format(0)}</span>
                </div>
            </div>

            <div className="border-t border-neutral-border pt-6">
                <div className="flex items-baseline justify-between">
                    <span className="text-base font-medium text-neutral-text-secondary">{t('checkout.total_due')}</span>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-neutral-text-primary">{plan.currency.format(totalDue)}</div>
                        <div className="text-xs text-neutral-text-secondary uppercase">{plan.currency.code} / {plan.interval}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
