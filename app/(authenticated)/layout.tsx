'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BottomNavbar from '@/components/BottomNavbar';
import QuickMealModal from '@/components/QuickMealModal';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import InstallPWA from '@/components/InstallPWA';


export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const [isQuickMealOpen, setIsQuickMealOpen] = useState(false);

    const handleQuickMealSuccess = () => {
        setIsQuickMealOpen(false);
        // This is a bit tricky with Next.js children. 
        // We might need a better way to communicate with the dashboard.
        // However, since we're using a Client Component layout, we can pass a prop or use a custom event.
        // For now, let's see if we can still use the ref pattern if we wrap the children.
        // Actually, in Next.js, children are just elements. 
        // We might need to use a Context for "Refresh" or just window events.
        window.dispatchEvent(new CustomEvent('refresh-dashboard'));
    };

    // Only show navbar if user is authenticated, not loading, and not on login page
    const isLoginPage = pathname === '/login';
    const showNavbar = user && !loading && !isLoginPage;

    return (
        <ProtectedRoute>
            <div className="bg-healthpal-dark min-h-screen text-healthpal-text-primary font-sans flex justify-center">
                <div className="w-full max-w-screen-2xl bg-healthpal-dark">
                    {showNavbar && (
                        <Navbar onQuickMealClick={() => setIsQuickMealOpen(true)} />
                    )}
                    <div className="pb-24 md:pb-0">
                        <main className="p-6 lg:p-8">
                            {children}
                        </main>
                        {showNavbar && <Footer />}
                    </div>
                    {showNavbar && (
                        <BottomNavbar onQuickMealClick={() => setIsQuickMealOpen(true)} />
                    )}
                </div>
            </div>
            <QuickMealModal
                isOpen={isQuickMealOpen}
                onClose={() => setIsQuickMealOpen(false)}
                onSuccess={handleQuickMealSuccess}
            />
            <InstallPWA />
        </ProtectedRoute>
    );
}
