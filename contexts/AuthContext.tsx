import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { RepositoryFactory } from '../data/RepositoryFactory';
import { AuthRepository } from '../domain/repositories/AuthRepository';
import { User } from '../domain/entities/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<User | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authRepository: AuthRepository = useMemo(() => RepositoryFactory.getAuthRepository(), []);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = authRepository.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authRepository]);

  const signIn = async (email: string, password?: string) => {
    setLoading(true);
    const signedInUser = await authRepository.signIn(email, password);
    // The onAuthStateChanged listener will handle setting the user and loading state.
    return signedInUser;
  };

  const signOut = async () => {
    setLoading(true);
    await authRepository.signOut();
    // The onAuthStateChanged listener will handle setting the user and loading state.
  };

  const value = { user, loading, signIn, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};