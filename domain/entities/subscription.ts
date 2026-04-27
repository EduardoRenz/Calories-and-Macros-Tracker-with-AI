export type SubscriptionStatus = 'pending' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'inactive';
export type BillingAccessStatus = 'free' | 'premium' | 'grace_locked';

export class Subscription {
    private readonly _id: string;
    private readonly _userId: string;
    private readonly _planId: string;
    private readonly _planCode: string;
    private readonly _status: SubscriptionStatus;
    private readonly _accessStatus: BillingAccessStatus;
    private readonly _currentPeriodStart: Date;
    private readonly _currentPeriodEnd: Date;
    private readonly _cancelAtPeriodEnd: boolean;
    private readonly _isTrial: boolean;

    private constructor(props: SubscriptionProps) {
        this._id = props.id;
        this._userId = props.userId;
        this._planId = props.planId;
        this._planCode = props.planCode;
        this._status = props.status;
        this._accessStatus = props.accessStatus;
        this._currentPeriodStart = props.currentPeriodStart;
        this._currentPeriodEnd = props.currentPeriodEnd;
        this._cancelAtPeriodEnd = props.cancelAtPeriodEnd;
        this._isTrial = props.isTrial || false;
    }

    public static create(props: SubscriptionProps): Subscription {
        return new Subscription(props);
    }

    public get id(): string {
        return this._id;
    }

    public get userId(): string {
        return this._userId;
    }

    public get planId(): string {
        return this._planId;
    }

    public get planCode(): string {
        return this._planCode;
    }

    public get status(): SubscriptionStatus {
        return this._status;
    }

    public get accessStatus(): BillingAccessStatus {
        return this._accessStatus;
    }

    public get currentPeriodStart(): Date {
        return this._currentPeriodStart;
    }

    public get currentPeriodEnd(): Date {
        return this._currentPeriodEnd;
    }

    public get cancelAtPeriodEnd(): boolean {
        return this._cancelAtPeriodEnd;
    }

    public get isTrial(): boolean {
        return this._isTrial;
    }

    public get isActive(): boolean {
        // Check both access status AND that the period hasn't expired
        if (this._accessStatus !== 'premium') {
            return false;
        }
        const now = new Date();
        return now <= this._currentPeriodEnd;
    }

    public get isFree(): boolean {
        return this._accessStatus === 'free';
    }

    public equals(other: Subscription): boolean {
        return other instanceof Subscription && this._id === other._id;
    }

    public toJSON(): SubscriptionProps {
        return {
            id: this._id,
            userId: this._userId,
            planId: this._planId,
            planCode: this._planCode,
            status: this._status,
            accessStatus: this._accessStatus,
            currentPeriodStart: this._currentPeriodStart,
            currentPeriodEnd: this._currentPeriodEnd,
            cancelAtPeriodEnd: this._cancelAtPeriodEnd,
            isTrial: this._isTrial,
        };
    }
}

export interface SubscriptionProps {
    id: string;
    userId: string;
    planId: string;
    planCode: string;
    status: SubscriptionStatus;
    accessStatus: BillingAccessStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    isTrial?: boolean;
}
