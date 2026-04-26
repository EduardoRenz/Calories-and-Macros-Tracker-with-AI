import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./package.json"), "utf8"));

const nextConfig: NextConfig = {
    reactStrictMode: true,
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

export default nextConfig;
