import type { Metadata, Viewport } from "next";
import { Montserrat, Lexend } from "next/font/google";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FeatureFlagProvider } from "@/contexts/FeatureFlagContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ToastProvider } from "@/contexts/ToastContext";
import SWRegistration from "@/components/SWRegistration";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CookieConsent } from "@/components/CookieConsent";
import { buildSeoMetadata } from "@/utils/seo/metadata";
import { buildSoftwareAppJsonLd } from "@/utils/seo/jsonld";
import JsonLd from "@/components/seo/JsonLd";

const APP_URL = "https://levemente.ia.br";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-body" });
const lexend = Lexend({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-label" });
const nearo = localFont({
    src: [
        {
            path: "../public/fonts/nearo/Nearo-Light.ttf",
            weight: "300",
            style: "normal",
        },
        {
            path: "../public/fonts/nearo/Nearo-Regular.ttf",
            weight: "400",
            style: "normal",
        },
        {
            path: "../public/fonts/nearo/Nearo-Medium.ttf",
            weight: "500",
            style: "normal",
        },
        {
            path: "../public/fonts/nearo/Nearo-SemiBold.ttf",
            weight: "600",
            style: "normal",
        },
        {
            path: "../public/fonts/nearo/Nearo-Bold.ttf",
            weight: "700",
            style: "normal",
        },
    ],
    display: "swap",
    adjustFontFallback: "Arial",
    variable: "--font-headline",
});

const seoMetadata = buildSeoMetadata({
    title: "LeveMente",
    description: "Acompanhe suas refeições e alcance seus objetivos de forma saudável.",
    path: "/",
});

export const metadata: Metadata = {
    ...seoMetadata,
    manifest: "/manifest.webmanifest",
    icons: {
        icon: "/Icon.svg",
        apple: "/pwa-solid-192x192.png",
    },
};

export const viewport: Viewport = {
    themeColor: "#f8fafa",
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${montserrat.variable} ${lexend.variable} ${nearo.variable} font-body bg-background text-on-surface`}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <JsonLd
                        data={buildSoftwareAppJsonLd({
                            name: "LeveMente AI",
                            description: "Acompanhe suas refeições e alcance seus objetivos de forma saudável.",
                            url: APP_URL,
                            operatingSystem: "Web, iOS, Android PWA",
                            applicationCategory: "HealthApplication",
                            price: "0",
                            priceCurrency: "BRL",
                        })}
                    />
                    <SWRegistration />
                    <LanguageProvider>
                        <FeatureFlagProvider>
                            <AuthProvider>
                                <SubscriptionProvider>
                                    <ToastProvider>
                                        {children}
                                        <CookieConsent />
                                    </ToastProvider>
                                </SubscriptionProvider>
                            </AuthProvider>
                        </FeatureFlagProvider>
                    </LanguageProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
