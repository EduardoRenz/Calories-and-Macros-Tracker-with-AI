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

        // Backend Provider
        BACKEND_PROVIDER: z.enum(['firebase', 'supabase', 'mock']),

        // Firebase Configuration
        FIREBASE_API_KEY: z.string().optional(),
        FIREBASE_AUTH_DOMAIN: z.string().optional(),
        FIREBASE_PROJECT_ID: z.string().optional(),
        FIREBASE_STORAGE_BUCKET: z.string().optional(),
        FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
        FIREBASE_APP_ID: z.string().optional(),
        FIREBASE_MEASUREMENT_ID: z.string().optional(),

        // Supabase Configuration
        SUPABASE_URL: z.string().optional(),
        SUPABASE_ANON_KEY: z.string().optional(),

        // Migration, Admin Credentials and backend service keys
        FIREBASE_CLIENT_EMAIL: z.string(),
        FIREBASE_PRIVATE_KEY: z.string(),

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
        GEMINI_FAST_DEFAULT_MODEL: process.env.GEMINI_FAST_DEFAULT_MODEL,
        GEMINI_PRO_DEFAULT_MODEL: process.env.GEMINI_PRO_DEFAULT_MODEL,
        BACKEND_PROVIDER: process.env.BACKEND_PROVIDER,
        FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
        FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
        FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
        FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
        FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
        FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        NODE_ENV: process.env.NODE_ENV,

        // Client variables
        NEXT_PUBLIC_PIX_KEY: process.env.NEXT_PUBLIC_PIX_KEY,
        NEXT_PUBLIC_BTC_ADDRESS: process.env.NEXT_PUBLIC_BTC_ADDRESS,
        NEXT_PUBLIC_USDC_ADDRESS: process.env.NEXT_PUBLIC_USDC_ADDRESS,
        NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    },

    /**
     * Run `build` or `dev` with SKIP_ENV_VALIDATION to skip env var validation.
     * This is especially useful for Docker builds.
     */
    skipValidation: !!process.env.SKIP_ENV_VALIDATION || process.env.BACKEND_PROVIDER === 'mock',

    /**
     * Makes it so that all variables including client side ones are validated.
     * Defaults to false.
     */
    emptyStringAsUndefined: true,
});

// Type exports for better TypeScript support
export type Env = typeof env;
