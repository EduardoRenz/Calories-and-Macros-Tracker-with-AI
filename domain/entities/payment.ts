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

export class Plan {
    private readonly _id: string;
    private readonly _name: string;
    private readonly _description?: string;
    private readonly _price: number;
    private readonly _currency: Currency;
    private readonly _interval: 'month' | 'year';
    private readonly _features: PlanFeature[];
    private readonly _isPopular?: boolean;
    private readonly _discountMessage?: string;
    private readonly _originalPrice?: number;

    private constructor(props: PlanProps) {
        this._id = props.id;
        this._name = props.name;
        this._description = props.description;
        this._price = props.price;
        this._currency = props.currency;
        this._interval = props.interval;
        this._features = props.features;
        this._isPopular = props.isPopular;
        this._discountMessage = props.discountMessage;
        this._originalPrice = props.originalPrice;
    }

    public static create(props: PlanProps): Plan {
        return new Plan(props);
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public get description(): string | undefined {
        return this._description;
    }

    public get price(): number {
        return this._price;
    }

    public get currency(): Currency {
        return this._currency;
    }

    public get interval(): 'month' | 'year' {
        return this._interval;
    }

    public get features(): PlanFeature[] {
        return [...this._features];
    }

    public get isPopular(): boolean | undefined {
        return this._isPopular;
    }

    public get discountMessage(): string | undefined {
        return this._discountMessage;
    }

    public get originalPrice(): number | undefined {
        return this._originalPrice;
    }

    public get formattedPrice(): string {
        return this._currency.format(this._price);
    }

    public get formattedOriginalPrice(): string | undefined {
        return this._originalPrice ? this._currency.format(this._originalPrice) : undefined;
    }

    public get discountPercentage(): number | undefined {
        if (!this._originalPrice || this._originalPrice <= this._price) {
            return undefined;
        }
        return Math.round(((this._originalPrice - this._price) / this._originalPrice) * 100);
    }

    public get hasDiscount(): boolean {
        return this._originalPrice !== undefined && this._originalPrice > this._price;
    }

    public get yearlyEquivalent(): number {
        return this._interval === 'year' ? this._price : this._price * 12;
    }

    public get formattedYearlyEquivalent(): string {
        return this._currency.format(this.yearlyEquivalent);
    }

    public get monthlyEquivalent(): number {
        return this._interval === 'month' ? this._price : this._price / 12;
    }

    public get formattedMonthlyEquivalent(): string {
        return this._currency.format(this.monthlyEquivalent);
    }

    public get savingsFromMonthly(): number | undefined {
        if (this._interval !== 'year') {
            return undefined;
        }
        const monthlyTotal = this.monthlyEquivalent * 12;
        return monthlyTotal - this.yearlyEquivalent;
    }

    public get formattedSavingsFromMonthly(): string | undefined {
        const savings = this.savingsFromMonthly;
        return savings !== undefined ? this._currency.format(savings) : undefined;
    }

    public equals(other: Plan): boolean {
        return other instanceof Plan && this._id === other._id;
    }

    public toJSON(): PlanProps {
        return {
            id: this._id,
            name: this._name,
            description: this._description,
            price: this._price,
            currency: this._currency,
            interval: this._interval,
            features: this._features,
            isPopular: this._isPopular,
            discountMessage: this._discountMessage,
            originalPrice: this._originalPrice,
        };
    }
}

export interface PlanProps {
    id: string;
    name: string;
    description?: string;
    price: number;
    currency: Currency;
    interval: 'month' | 'year';
    features: PlanFeature[];
    isPopular?: boolean;
    discountMessage?: string;
    originalPrice?: number;
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
    url?: string;
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
