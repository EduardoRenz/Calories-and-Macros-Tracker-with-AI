export class AiAccessException extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly originalError?: unknown
    ) {
        super(message);
        this.name = 'AiAccessException';
        Object.setPrototypeOf(this, AiAccessException.prototype);
    }
}

export class AiDisabledException extends AiAccessException {
    constructor(message: string = 'AI features are currently disabled') {
        super(message, 'AI_DISABLED');
        this.name = 'AiDisabledException';
        Object.setPrototypeOf(this, AiDisabledException.prototype);
    }
}

export class PremiumOnlyException extends AiAccessException {
    constructor(message: string = 'Premium subscription required') {
        super(message, 'PREMIUM_ONLY');
        this.name = 'PremiumOnlyException';
        Object.setPrototypeOf(this, PremiumOnlyException.prototype);
    }
}

export class ApiKeysRequiredException extends AiAccessException {
    constructor(message: string = 'Please add your API keys in settings to use this feature') {
        super(message, 'API_KEYS_REQUIRED');
        this.name = 'ApiKeysRequiredException';
        Object.setPrototypeOf(this, ApiKeysRequiredException.prototype);
    }
}
