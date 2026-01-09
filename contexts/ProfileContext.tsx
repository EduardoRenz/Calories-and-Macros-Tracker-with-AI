'use client';
import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { RepositoryFactory } from '../data/RepositoryFactory';
import { ProfileRepository } from '../domain/repositories/ProfileRepository';
import { UserProfile } from '../domain/entities/profile';

interface ProfileContextType {
    profile: UserProfile | null;
    loading: boolean;
    updateProfile: (profile: UserProfile) => Promise<void>;
    refreshProfile: () => Promise<void>;
    editProfile: (updates: Partial<UserProfile>) => void;
    resetProfile: () => void;
    hasChanges: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const profileRepository: ProfileRepository = useMemo(() => RepositoryFactory.getProfileRepository(), []);

    const refreshProfile = async () => {
        setLoading(true);
        try {
            const userProfile = await profileRepository.getProfile();
            setProfile(userProfile);
            setOriginalProfile(userProfile);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshProfile();
    }, [profileRepository]);

    const updateProfile = async (updatedProfile: UserProfile) => {
        setLoading(true);
        try {
            await profileRepository.updateProfile(updatedProfile);
            await refreshProfile(); // Refresh to get the latest data
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const editProfile = (updates: Partial<UserProfile>) => {
        if (!profile) return;
        setProfile(prev => prev ? { ...prev, ...updates } : null);
    };

    const resetProfile = () => {
        setProfile(originalProfile);
    };

    const hasChanges = useMemo(() => {
        if (!profile || !originalProfile) return false;
        return JSON.stringify(profile) !== JSON.stringify(originalProfile);
    }, [profile, originalProfile]);

    const value = { profile, loading, updateProfile, refreshProfile, editProfile, resetProfile, hasChanges };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};
