export class ImageAnalysisException extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly originalError?: unknown
    ) {
        super(message);
        this.name = 'ImageAnalysisException';
        Object.setPrototypeOf(this, ImageAnalysisException.prototype);
    }
}

export class ImageTooLargeException extends ImageAnalysisException {
    constructor(message: string = 'The uploaded image is too large') {
        super(message, 'IMAGE_TOO_LARGE');
        this.name = 'ImageTooLargeException';
        Object.setPrototypeOf(this, ImageTooLargeException.prototype);
    }
}

export class InvalidApiKeyException extends ImageAnalysisException {
    constructor(public readonly provider: string, message: string = 'Invalid or expired API key') {
        super(message, 'INVALID_API_KEY');
        this.name = 'InvalidApiKeyException';
        Object.setPrototypeOf(this, InvalidApiKeyException.prototype);
    }
}

export class EmptyAnalysisResultException extends ImageAnalysisException {
    constructor(message: string = 'No ingredients identified in the image') {
        super(message, 'EMPTY_RESULT');
        this.name = 'EmptyAnalysisResultException';
        Object.setPrototypeOf(this, EmptyAnalysisResultException.prototype);
    }
}

export class RateLimitedException extends ImageAnalysisException {
    constructor(message: string = 'AI service is rate limited, please try again later') {
        super(message, 'RATE_LIMITED');
        this.name = 'RateLimitedException';
        Object.setPrototypeOf(this, RateLimitedException.prototype);
    }
}

export class InsufficientCreditsException extends ImageAnalysisException {
    constructor(public readonly provider: string, message: string = 'The AI provider account has insufficient credits') {
        super(message, 'INSUFFICIENT_CREDITS');
        this.name = 'InsufficientCreditsException';
        Object.setPrototypeOf(this, InsufficientCreditsException.prototype);
    }
}
