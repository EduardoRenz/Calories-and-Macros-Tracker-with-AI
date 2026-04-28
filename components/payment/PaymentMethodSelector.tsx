import React from 'react';
import { PaymentMethodType } from '../../domain/entities/payment';
import { useTranslation } from '../../hooks/useTranslation';

interface PaymentMethodSelectorProps {
    selectedMethod: PaymentMethodType;
    onSelect: (method: PaymentMethodType) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ selectedMethod, onSelect }) => {
    const { t } = useTranslation();

    const methods: { id: PaymentMethodType; labelKey: string; icon: string }[] = [
        {
            id: 'card',
            labelKey: 'checkout.payment_methods.card',
            icon: '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>'
        },
        {
            id: 'paypal',
            labelKey: 'checkout.payment_methods.paypal',
            icon: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7.076 21.337l.756-4.632 4.067-.028c3.569 0 6.002-1.636 6.866-5.466.529-2.351-.235-4.526-2.583-5.741H7.558l-1.996 15.867h1.514z"/></svg>'
        },
        {
            id: 'pix',
            labelKey: 'checkout.payment_methods.pix',
            icon: '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>'
        },
        {
            id: 'crypto',
            labelKey: 'checkout.payment_methods.crypto',
            icon: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14.5 13.5c0-1.65-1.35-3-3-3h-1.8v2.4h1.8c.45 0 .9...2.7zM11.5 8h2.1c1.2 0 2.1.8 2.1 2s-.9 2-2.1 2h-2.1V8z"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 10.5c0 1.9-1.5 3.5-3.5 3.5h-3v2.5h-2V16h-1v-2h-1v-2h2v-2h-2V8h2V6h2v2h3.5c1.9 0 3.5 1.6 3.5 3.5 0 1.3-.7 2.4-1.8 3 .9.5 1.6 1.6 1.6 2.8z"/></svg>'
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {methods.map((method) => {
                const isSelected = selectedMethod === method.id;
                return (
                    <button
                        key={method.id}
                        type="button"
                        onClick={() => onSelect(method.id)}
                        className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all ${isSelected
                            ? 'border-green-500 bg-green-500/10 text-white'
                            : 'border-gray-800 bg-gray-900/50 text-gray-400 hover:border-gray-700 hover:bg-gray-800'
                            } relative`}
                    >
                        {isSelected && (
                            <div className="absolute right-2 top-2 h-4 w-4 rounded-full bg-green-500 text-black p-0.5">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                        )}
                        <div dangerouslySetInnerHTML={{ __html: method.icon }} className={isSelected ? 'text-green-500' : 'text-gray-400'} />
                        <span className="text-sm font-medium">{t(method.labelKey)}</span>
                    </button>
                );
            })}
        </div>
    );
};
