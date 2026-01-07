export type CurrencyCode = 'USD' | 'BRL';

export class Currency {
    private readonly _code: CurrencyCode;
    private readonly _symbol: string;
    private readonly _decimalPlaces: number;

    private constructor(code: CurrencyCode) {
        this._code = code;
        this._symbol = Currency.getSymbol(code);
        this._decimalPlaces = Currency.getDecimalPlaces(code);
    }

    public static create(code: string): Currency {
        if (!Currency.isValid(code)) {
            throw new Error(`Invalid currency code: ${code}. Supported codes: USD, BRL`);
        }
        return new Currency(code as CurrencyCode);
    }

    public static USD(): Currency {
        return new Currency('USD');
    }

    public static BRL(): Currency {
        return new Currency('BRL');
    }

    private static isValid(code: string): boolean {
        return ['USD', 'BRL'].includes(code);
    }

    private static getSymbol(code: CurrencyCode): string {
        switch (code) {
            case 'USD':
                return '$';
            case 'BRL':
                return 'R$';
            default:
                throw new Error(`No symbol defined for currency: ${code}`);
        }
    }

    private static getDecimalPlaces(code: CurrencyCode): number {
        switch (code) {
            case 'USD':
                return 2;
            case 'BRL':
                return 2;
            default:
                return 2;
        }
    }

    public get code(): CurrencyCode {
        return this._code;
    }

    public get symbol(): string {
        return this._symbol;
    }

    public get decimalPlaces(): number {
        return this._decimalPlaces;
    }

    public format(amount: number): string {
        const formattedAmount = amount.toFixed(this._decimalPlaces);
        
        switch (this._code) {
            case 'USD':
                return `${this._symbol}${formattedAmount}`;
            case 'BRL':
                return `${this._symbol} ${formattedAmount.replace('.', ',')}`;
            default:
                return `${this._symbol}${formattedAmount}`;
        }
    }

    public formatInternational(amount: number): string {
        return `${amount.toFixed(this._decimalPlaces)} ${this._code}`;
    }

    public parseAmount(formattedString: string): number {
        const cleanString = formattedString.replace(/[^\d.,]/g, '');
        
        if (this._code === 'BRL') {
            return parseFloat(cleanString.replace('.', '').replace(',', '.'));
        }
        
        return parseFloat(cleanString.replace(',', ''));
    }

    public equals(other: Currency): boolean {
        return other instanceof Currency && this._code === other._code;
    }

    public toJSON(): CurrencyCode {
        return this._code;
    }

    public toString(): string {
        return this._code;
    }
}

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
