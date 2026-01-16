export const DEFAULT_MODEL_CONFIG = {
    gemini: {
        chat: 'gemini-2.5-flash-lite',
        food: 'gemini-2.5-flash-lite',
        nutrition: 'gemini-3-flash-preview',
        image: 'gemini-2.5-flash'
    },
    openai: {
        chat: 'gpt-4o',
        food: 'gpt-4o',
        nutrition: 'gpt-4o',
        image: 'gpt-4o'
    },
    deepseek: {
        chat: 'deepseek-chat',
        food: 'deepseek-chat',
        nutrition: 'deepseek-chat',
        image: 'deepseek-chat'
    }
} as const;

export type ModelConfig = typeof DEFAULT_MODEL_CONFIG;
