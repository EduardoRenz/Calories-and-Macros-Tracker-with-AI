'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BottomNavbar from '@/components/BottomNavbar';
import QuickMealModal from '@/components/QuickMealModal';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import InstallPWA from '@/components/InstallPWA';
import { RepositoryFactory } from '@/data/RepositoryFactory';
import type { Ingredient, MealSummary } from '@/domain/entities/dashboard';
import { ChatAssistantProvider } from '@/contexts/ChatAssistantContext';


export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const [isQuickMealOpen, setIsQuickMealOpen] = useState(false);
    const dashboardRepository = RepositoryFactory.getDashboardRepository();

    const handleQuickAddIngredients = async (date: string, mealType: keyof MealSummary, ingredients: Omit<Ingredient, 'id'>[]) => {
        await dashboardRepository.addIngredients(date, mealType, ingredients);
    };

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
            <ProfileProvider>
                <ChatAssistantProvider>
                    <div className="bg-neutral-dark min-h-screen text-neutral-text-primary font-sans flex flex-col">
                        <div className="flex justify-center flex-1">
                            <div className="w-full max-w-screen-2xl bg-neutral-dark flex flex-col min-h-screen">
                                {showNavbar && (
                                    <Navbar onQuickMealClick={() => setIsQuickMealOpen(true)} />
                                )}
                                <div className="flex-1 pb-24 md:pb-0">
                                    <main className="p-6 lg:p-8">
                                        {children}
                                    </main>
                                </div>
                            </div>
                        </div>
                    </div>
                    {showNavbar && <Footer />}
                    {showNavbar && (
                        <BottomNavbar onQuickMealClick={() => setIsQuickMealOpen(true)} />
                    )}
                    <QuickMealModal
                        isOpen={isQuickMealOpen}
                        onClose={() => setIsQuickMealOpen(false)}
                        onSuccess={handleQuickMealSuccess}
                        onAddIngredients={handleQuickAddIngredients}
                    />
                    <InstallPWA />
                </ChatAssistantProvider>
            </ProfileProvider>
        </ProtectedRoute>
    );
}
