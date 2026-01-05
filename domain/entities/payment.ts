export type Currency = 'USD' | 'BRL';

export interface PlanFeature {
    text: string;
    included: boolean;
}

export interface Plan {
    id: string;
    name: string;
    description?: string;
    price: number;
    currency: Currency;
    interval: 'month' | 'year'; // billing frequency
    features: PlanFeature[];
    isPopular?: boolean;
    discountMessage?: string;
    originalPrice?: number; // for showing strikethrough prices if needed (e.g. yearly plan breakdown)
}

export type PaymentMethodType = 'card' | 'paypal' | 'pix' | 'crypto';

export interface PaymentMethod {
    id: string;
    type: PaymentMethodType;
    last4?: string; // for cards
    brand?: string; // for cards
    label: string;
}

export interface Transaction {
    id: string;
    userId: string;
    planId: string;
    amount: number;
    currency: Currency;
    status: 'pending' | 'completed' | 'failed';
    date: Date;
    paymentMethod: PaymentMethodType;
}

export interface PaymentData {
    userId: string;
    planId: string;
    paymentMethod: PaymentMethodType;
    // Card details (mock)
    cardName?: string;
    cardNumber?: string;
    cardExpiry?: string;
    cardCvc?: string;
}
