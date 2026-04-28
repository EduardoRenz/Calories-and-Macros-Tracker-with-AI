export const DEFAULT_MODEL_CONFIG = {
    "gemini": {
        "chat": "gemini-3.1-flash-lite-preview",
        "food": "gemini-3.1-flash-lite-preview",
        "nutrition": "gemini-3.1-flash",
        "image": "gemini-3.1-flash"
    },
    "openai": {
        "chat": "gpt-4o",
        "food": "gpt-4o",
        "nutrition": "gpt-4o",
        "image": "gpt-4o"
    },
    "deepseek": {
        "chat": "deepseek-v4-flash",
        "food": "deepseek-v4-flash",
        "nutrition": "deepseek-v4-flash",
        "image": "deepseek-v4-flash"
    },
    "openrouter": {
        "chat": "openrouter/auto",
        "food": "openrouter/auto",
        "nutrition": "openrouter/auto",
        "image": "openrouter/auto"
    }
} as const;

export type ModelConfig = typeof DEFAULT_MODEL_CONFIG;
