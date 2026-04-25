import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
    /**
     * Specify your server-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars.
     */
    server: {
        // Gemini API Configuration
        GEMINI_API_KEY: z.string().min(1, 'Gemini API key is required'),
        GEMINI_FAST_DEFAULT_MODEL: z.string().default('gemini-3-flash-preview'),
        GEMINI_PRO_DEFAULT_MODEL: z.string().default('gemini-3-pro-preview'),

        // Payment Configuration
        ABACATE_PAY_API_KEY: z.string().optional(),
        // Payment Provider (Server-side selection)
        PAYMENT_PROVIDER: z.enum(['abacatepay', 'mock']),

        // Migration, Admin Credentials and backend service keys (server-only)
        FIREBASE_CLIENT_EMAIL: z.string(),
        FIREBASE_PRIVATE_KEY: z.string(),

        // Supabase Configuration (Server-side)
        SUPABASE_URL: z.string(),
        SUPABASE_PUBLISHABLE_KEY: z.string(),

        // Supabase Service Role Key (for server-side operations and migrations)
        SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

        NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    },

    /**
     * Specify your client-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars. To expose them to the client, prefix them with
     * `NEXT_PUBLIC_`.
     */
    client: {
        // Backend Provider (Client-side selection)
        NEXT_PUBLIC_BACKEND_PROVIDER: z.enum(['firebase', 'supabase', 'mock']),

        // Gemini Models (Public - client-side)
        NEXT_PUBLIC_GEMINI_FAST_DEFAULT_MODEL: z.string().default('gemini-3-flash-preview'),
        NEXT_PUBLIC_GEMINI_PRO_DEFAULT_MODEL: z.string().default('gemini-3-pro-preview'),

        // Firebase Configuration (Public - client-side)
        NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
        NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),

        // Supabase Configuration (Public - client-side)
        NEXT_PUBLIC_SUPABASE_URL: z.string(),
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string(),

        // Donation Information (Public - available on client side)
        NEXT_PUBLIC_PIX_KEY: z.string().optional(),
        NEXT_PUBLIC_BTC_ADDRESS: z.string().optional(),
        NEXT_PUBLIC_USDC_ADDRESS: z.string().optional(),
        NEXT_PUBLIC_APP_VERSION: z.string().optional(),
    },

    /**
     * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
     * middlewares) or client-side so we need to destruct manually.
     */
    runtimeEnv: {
        // Server variables
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        GEMINI_FAST_DEFAULT_MODEL: process.env.NEXT_PUBLIC_GEMINI_FAST_DEFAULT_MODEL,
        ABACATE_PAY_API_KEY: process.env.ABACATE_PAY_API_KEY,
        GEMINI_PRO_DEFAULT_MODEL: process.env.GEMINI_PRO_DEFAULT_MODEL,
        FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER,

        NODE_ENV: process.env.NODE_ENV,

        // Client variables
        NEXT_PUBLIC_BACKEND_PROVIDER: process.env.NEXT_PUBLIC_BACKEND_PROVIDER,
        NEXT_PUBLIC_GEMINI_FAST_DEFAULT_MODEL: process.env.NEXT_PUBLIC_GEMINI_FAST_DEFAULT_MODEL,
        NEXT_PUBLIC_GEMINI_PRO_DEFAULT_MODEL: process.env.NEXT_PUBLIC_GEMINI_PRO_DEFAULT_MODEL,
        NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        NEXT_PUBLIC_PIX_KEY: process.env.NEXT_PUBLIC_PIX_KEY,
        NEXT_PUBLIC_BTC_ADDRESS: process.env.NEXT_PUBLIC_BTC_ADDRESS,
        NEXT_PUBLIC_USDC_ADDRESS: process.env.NEXT_PUBLIC_USDC_ADDRESS,
        NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    },

    /**
     * Run `build` or `dev` with SKIP_ENV_VALIDATION to skip env var validation.
     * This is especially useful for Docker builds.
     */
    skipValidation: !!process.env.SKIP_ENV_VALIDATION || process.env.NEXT_PUBLIC_BACKEND_PROVIDER === 'mock',

    /**
     * Makes it so that all variables including client side ones are validated.
     * Defaults to false.
     */
    emptyStringAsUndefined: true,
});

// Type exports for better TypeScript support
export type Env = typeof env;
