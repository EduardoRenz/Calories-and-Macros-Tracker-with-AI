import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./package.json"), "utf8"));

const nextConfig: NextConfig = {
    reactStrictMode: true,
    // Ensure we don't leak server-side env vars to the client accidentally
    // Next.js does this by default (only NEXT_PUBLIC_ is exposed),
    // but we should be aware of this.
    env: {
        NEXT_PUBLIC_APP_VERSION: packageJson.version,
        NEXT_PUBLIC_USE_MOCKS: process.env.NEXT_PUBLIC_USE_MOCKS,
        FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
        FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
        FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
        FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
        FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
    },
};

export default nextConfig;
