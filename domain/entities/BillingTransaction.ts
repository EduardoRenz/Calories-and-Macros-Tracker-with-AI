import { Currency } from './payment';

export type BillingTransactionType = 'charge' | 'renewal' | 'refund' | 'dispute' | 'loss';
export type BillingTransactionStatus = 'paid' | 'failed' | 'refunded' | 'disputed' | 'lost';

export interface BillingTransactionProps {
    id: string;
    userId: string;
    subscriptionId?: string;
    provider: string;
    providerTransactionId: string;
    providerCheckoutId?: string;
    type: BillingTransactionType;
    status: BillingTransactionStatus;
    amountCents: number;
    currency: Currency;
    occurredAt: Date;
    receiptUrl?: string;
    metadata?: Record<string, unknown>;
}

export class BillingTransaction {
    private readonly _id: string;
    private readonly _userId: string;
    private readonly _subscriptionId?: string;
    private readonly _provider: string;
    private readonly _providerTransactionId: string;
    private readonly _providerCheckoutId?: string;
    private readonly _type: BillingTransactionType;
    private readonly _status: BillingTransactionStatus;
    private readonly _amountCents: number;
    private readonly _currency: Currency;
    private readonly _occurredAt: Date;
    private readonly _receiptUrl?: string;
    private readonly _metadata: Record<string, unknown>;

    private constructor(props: BillingTransactionProps) {
        this._id = props.id;
        this._userId = props.userId;
        this._subscriptionId = props.subscriptionId;
        this._provider = props.provider;
        this._providerTransactionId = props.providerTransactionId;
        this._providerCheckoutId = props.providerCheckoutId;
        this._type = props.type;
        this._status = props.status;
        this._amountCents = props.amountCents;
        this._currency = props.currency;
        this._occurredAt = props.occurredAt;
        this._receiptUrl = props.receiptUrl;
        this._metadata = props.metadata || {};
    }

    public static create(props: BillingTransactionProps): BillingTransaction {
        return new BillingTransaction(props);
    }

    public get id(): string { return this._id; }
    public get userId(): string { return this._userId; }
    public get subscriptionId(): string | undefined { return this._subscriptionId; }
    public get provider(): string { return this._provider; }
    public get providerTransactionId(): string { return this._providerTransactionId; }
    public get providerCheckoutId(): string | undefined { return this._providerCheckoutId; }
    public get type(): BillingTransactionType { return this._type; }
    public get status(): BillingTransactionStatus { return this._status; }
    public get amountCents(): number { return this._amountCents; }
    public get amount(): number { return this._amountCents / 100; }
    public get currency(): Currency { return this._currency; }
    public get occurredAt(): Date { return this._occurredAt; }
    public get receiptUrl(): string | undefined { return this._receiptUrl; }
    public get metadata(): Record<string, unknown> { return { ...this._metadata }; }

    public toJSON(): BillingTransactionProps {
        return {
            id: this._id,
            userId: this._userId,
            subscriptionId: this._subscriptionId,
            provider: this._provider,
            providerTransactionId: this._providerTransactionId,
            providerCheckoutId: this._providerCheckoutId,
            type: this._type,
            status: this._status,
            amountCents: this._amountCents,
            currency: this._currency,
            occurredAt: this._occurredAt,
            receiptUrl: this._receiptUrl,
            metadata: this._metadata,
        };
    }
}
