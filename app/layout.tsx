import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import SWRegistration from "@/components/SWRegistration";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Calorie Counter & Macro Tracker",
    description: "Track your calories and macros with ease.",
    manifest: "/manifest.webmanifest",
    icons: {
        apple: "/pwa-192x192.png",
    },
};

export const viewport: Viewport = {
    themeColor: "#101614",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <SWRegistration />
                <LanguageProvider>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
