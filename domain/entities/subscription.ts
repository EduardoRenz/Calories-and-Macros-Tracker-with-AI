export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'inactive';

export class Subscription {
    private readonly _id: string;
    private readonly _userId: string;
    private readonly _planId: string;
    private readonly _status: SubscriptionStatus;
    private readonly _currentPeriodStart: Date;
    private readonly _currentPeriodEnd: Date;
    private readonly _cancelAtPeriodEnd: boolean;

    private constructor(props: SubscriptionProps) {
        this._id = props.id;
        this._userId = props.userId;
        this._planId = props.planId;
        this._status = props.status;
        this._currentPeriodStart = props.currentPeriodStart;
        this._currentPeriodEnd = props.currentPeriodEnd;
        this._cancelAtPeriodEnd = props.cancelAtPeriodEnd;
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

    public get status(): SubscriptionStatus {
        return this._status;
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

    public get isActive(): boolean {
        return this._status === 'active' || this._status === 'trialing';
    }

    public get isFree(): boolean {
        return this._planId === 'free' || !this.isActive;
    }

    public equals(other: Subscription): boolean {
        return other instanceof Subscription && this._id === other._id;
    }

    public toJSON(): SubscriptionProps {
        return {
            id: this._id,
            userId: this._userId,
            planId: this._planId,
            status: this._status,
            currentPeriodStart: this._currentPeriodStart,
            currentPeriodEnd: this._currentPeriodEnd,
            cancelAtPeriodEnd: this._cancelAtPeriodEnd,
        };
    }
}

export interface SubscriptionProps {
    id: string;
    userId: string;
    planId: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
}
