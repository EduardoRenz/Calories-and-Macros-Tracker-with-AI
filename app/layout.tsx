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
    variable: "--font-headline",
});

export const metadata: Metadata = {
    title: "LeveMente",
    description: "Acompanhe suas refeições e alcance seus objetivos de forma saudável.",
    manifest: "/manifest.webmanifest",
    icons: {
        icon: "/Icon.svg",
        apple: "/pwa-192x192.png",
    },
};

export const viewport: Viewport = {
    themeColor: "#f8fafa",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
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
                    <SWRegistration />
                    <LanguageProvider>
                    <FeatureFlagProvider>
                        <AuthProvider>
                            <SubscriptionProvider>
                                <ToastProvider>
                                    {children}
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
