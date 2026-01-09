import React from 'react';
import { Plan } from '../../domain/entities/payment';
import { useTranslation } from '../../hooks/useTranslation';

interface OrderSummaryProps {
    plan: Plan;
    taxRate?: number; // 0.0 for now as per screenshot
}

export const CheckoutSummary: React.FC<OrderSummaryProps> = ({ plan, taxRate = 0 }) => {
    const { t } = useTranslation();

    // Use Plan value object methods for calculations
    let subtotal = plan.price;
    const totalDue = plan.price;
    let discountAmount = 0;

    // Use the value object's discount calculations
    if (plan.hasDiscount && plan.originalPrice) {
        subtotal = plan.originalPrice;
        discountAmount = subtotal - totalDue;
    }

    return (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">{t('checkout.order_summary')}</h2>

            <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                    {/* Icon */}
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                </div>
                <div>
                    <h3 className="font-semibold text-white">{plan.name}</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">
                            {plan.description?.split('.')[0] || `Billed ${plan.interval}ly`}
                        </span>
                        {plan.discountPercentage && (
                            <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] font-bold text-green-500">
                                -{plan.discountPercentage}%
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mb-6 space-y-3 border-t border-gray-800 pt-6">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t('checkout.subtotal')}</span>
                    <span className="text-white">{plan.currency.format(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-green-500">{t('checkout.annual_discount')}</span>
                        <span className="text-green-500">-{plan.currency.format(discountAmount)}</span>
                    </div>
                )}
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t('checkout.tax')} ({taxRate}%)</span>
                    <span className="text-white">{plan.currency.format(0)}</span>
                </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
                <div className="flex items-baseline justify-between">
                    <span className="text-base font-medium text-gray-300">{t('checkout.total_due')}</span>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">{plan.currency.format(totalDue)}</div>
                        <div className="text-xs text-gray-500 uppercase">{plan.currency.code} / {plan.interval}</div>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        className="w-full rounded-lg bg-green-500 py-3 text-sm font-semibold text-black transition-colors hover:bg-green-400"
                        form="checkout-form" // Triggers submit on the form outside this component
                        type="submit"
                    >
                        {t('checkout.confirm_purchase')}
                    </button>
                    <div className="mt-4 flex justify-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            {t('checkout.secure_payments')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
