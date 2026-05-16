export class ChatAssistantException extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly originalError?: unknown
    ) {
        super(message);
        this.name = 'ChatAssistantException';
        Object.setPrototypeOf(this, ChatAssistantException.prototype);
    }
}

export class ChatAssistantApiException extends ChatAssistantException {
    constructor(message: string, originalError?: unknown) {
        super(message, 'API_ERROR', originalError);
        this.name = 'ChatAssistantApiException';
        Object.setPrototypeOf(this, ChatAssistantApiException.prototype);
    }
}

export class ChatAssistantAuthException extends ChatAssistantException {
    constructor(message: string, originalError?: unknown) {
        super(message, 'AUTH_ERROR', originalError);
        this.name = 'ChatAssistantAuthException';
        Object.setPrototypeOf(this, ChatAssistantAuthException.prototype);
    }
}
