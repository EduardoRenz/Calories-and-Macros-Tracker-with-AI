'use client';
import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { RepositoryFactory } from '../data/RepositoryFactory';
import { SubscriptionRepository } from '../domain/repositories/SubscriptionRepository';
import { Subscription } from '../domain/entities/subscription';
import { BillingTransaction } from '../domain/entities/BillingTransaction';

interface SubscriptionContextType {
    subscription: Subscription | null;
    billingHistory: BillingTransaction[];
    loading: boolean;
    loadingHistory: boolean;
    refreshSubscription: () => Promise<void>;
    refreshHistory: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [billingHistory, setBillingHistory] = useState<BillingTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(false);
    
    const subscriptionRepository: SubscriptionRepository = useMemo(() => RepositoryFactory.getSubscriptionRepository(), []);

    const refreshSubscription = useCallback(async () => {
        setLoading(true);
        try {
            const userSubscription = await subscriptionRepository.getUserSubscription();
            setSubscription(userSubscription);
        } catch (error) {
            console.error('Error fetching subscription:', error);
            setSubscription(null);
        } finally {
            setLoading(false);
        }
    }, [subscriptionRepository]);

    const refreshHistory = useCallback(async () => {
        setLoadingHistory(true);
        try {
            const history = await subscriptionRepository.getBillingHistory();
            setBillingHistory(history);
        } catch (error) {
            console.error('Error fetching billing history:', error);
            setBillingHistory([]);
        } finally {
            setLoadingHistory(false);
        }
    }, [subscriptionRepository]);

    useEffect(() => {
        refreshSubscription();
    }, [refreshSubscription]);

    const value = { 
        subscription, 
        billingHistory,
        loading, 
        loadingHistory,
        refreshSubscription,
        refreshHistory
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};
