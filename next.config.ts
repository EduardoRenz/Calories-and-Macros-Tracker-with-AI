import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import fs from "fs";
import path from "path";

const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./package.json"), "utf8"));

const nextConfig: NextConfig = {
    reactStrictMode: true,
    outputFileTracingRoot: __dirname,
    turbopack: {
        root: __dirname,
    },
    distDir: 'dist',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
        ],
    },
    env: {
        NEXT_PUBLIC_APP_VERSION: packageJson.version,
    },
};

export default withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    silent: true,
    telemetry: false,
    sourcemaps: {
        disable: !process.env.SENTRY_AUTH_TOKEN,
    },
});
