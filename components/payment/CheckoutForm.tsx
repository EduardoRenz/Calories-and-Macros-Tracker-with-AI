import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

export const CheckoutForm: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{t('checkout.cardholder_name')}</label>
                <input
                    type="text"
                    name="cardName"
                    placeholder={t('checkout.cardholder_name_placeholder')}
                    className="w-full rounded-lg border border-gray-800 bg-black/50 p-3 text-white placeholder-gray-600 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{t('checkout.card_number')}</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </div>
                    <input
                        type="text"
                        name="cardNumber"
                        placeholder={t('checkout.card_number_placeholder')}
                        className="w-full rounded-lg border border-gray-800 bg-black/50 p-3 pl-10 text-white placeholder-gray-600 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">{t('checkout.expiry_date')}</label>
                    <input
                        type="text"
                        name="expiryDate"
                        placeholder={t('checkout.expiry_date_placeholder')}
                        className="w-full rounded-lg border border-gray-800 bg-black/50 p-3 text-white placeholder-gray-600 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">{t('checkout.cvc')}</label>
                    <div className="relative">
                        <input
                            type="text"
                            name="cvc"
                            placeholder={t('checkout.cvc_placeholder')}
                            className="w-full rounded-lg border border-gray-800 bg-black/50 p-3 text-white placeholder-gray-600 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
                            <svg className="h-4 w-4 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
