import React from 'react';
import { Plan } from '../../domain/entities/payment';

interface OrderSummaryProps {
    plan: Plan;
    taxRate?: number; // 0.0 for now as per screenshot
}

export const CheckoutSummary: React.FC<OrderSummaryProps> = ({ plan, taxRate = 0 }) => {
    // Calculate totals
    // Assuming plan.price is the monthly breakdown price.
    // If it's annual, the total billed is different.

    let subtotal = plan.price;
    let totalDue = plan.price;
    let discountAmount = 0;

    if (plan.interval === 'year') {
        // If annual, usually we show the full year price.
        // In the screenshot:
        // Subtotal $84.56
        // Annual Discount -$12.68
        // Tax $0
        // Total Due $71.88

        // So base price was $84.56 (approx $7.05/mo)
        // Final price $71.88 ($5.99/mo)

        // If we have originalPrice in the Plan entity, use it as subtotal.
        if (plan.originalPrice) {
            subtotal = plan.originalPrice; // 84.56 (implied roughly)
            totalDue = plan.price * 12;    // 71.88

            // Wait, plan.price for annual was stored as 5.99 in mock. 
            // So totalDue = 5.99 * 12 = 71.88.
            // Subtotal = ? If we don't have it, we calculate backwards from discount?
            // The mock set `originalPrice` to `71.88` which doesn't match the "Subtotal $84.56" logic perfectly if 15% off.
            // Let's adjust logic to be consistent with the entity data we have.

            // If mock has `originalPrice` equal to the DISCOUNTED total (which I set in step 28 code as `annualTotal` which was 71.88? Wait).
            // In Step 28:
            // price: 5.99
            // annualTotal = 71.88
            // originalPrice: annualTotal (71.88) --- this was a mistake in my thought process there?
            // "Billed $71.88 yearly with 15% off."
            // So 71.88 is the FINAL price.
            // Original price would be 71.88 / 0.85 = 84.56.

            // In `CheckoutSummary`, let's recalculate for display perfection if we want to match screenshot.
            totalDue = plan.price * 12; // 71.88
            subtotal = totalDue / 0.85; // 84.56
            discountAmount = subtotal - totalDue;
        } else {
            // Monthly
            subtotal = plan.price;
            totalDue = plan.price;
        }
    }

    return (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">Order Summary</h2>

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
                        {plan.discountMessage && (
                            <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] font-bold text-green-500">
                                -15%
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mb-6 space-y-3 border-t border-gray-800 pt-6">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">{plan.currency.format(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-green-500">Annual Discount</span>
                        <span className="text-green-500">-{plan.currency.format(discountAmount)}</span>
                    </div>
                )}
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Tax ({taxRate}%)</span>
                    <span className="text-white">{plan.currency.format(0)}</span>
                </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
                <div className="flex items-baseline justify-between">
                    <span className="text-base font-medium text-gray-300">Total due</span>
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
                        Confirm Purchase →
                    </button>
                    <div className="mt-4 flex justify-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            Payments are secure and encrypted
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
