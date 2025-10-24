import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { HealthPalLogo } from './icons';

const LoginPage: React.FC = () => {
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password'); // Will be ignored by mock auth

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading) {
        signIn(email, password);
    }
  };

  return (
    <div className="bg-healthpal-dark min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
            <form onSubmit={handleSubmit} className="bg-healthpal-panel p-8 rounded-2xl border border-healthpal-border text-center shadow-2xl">
                <div className="flex justify-center items-center gap-4 mb-4">
                    <HealthPalLogo className="h-10 w-10 text-healthpal-green" />
                    <h1 className="text-3xl font-bold text-healthpal-text-primary">CalorieApp</h1>
                </div>
                <p className="text-healthpal-text-secondary mb-8">
                    Sign in to track your meals. Any password will work.
                </p>
                <div className="space-y-4 text-left">
                    <div>
                        <label className="block text-sm font-medium text-healthpal-text-secondary mb-2">Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            className="w-full bg-healthpal-card border border-healthpal-border rounded-lg p-3" 
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-healthpal-text-secondary mb-2">Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className="w-full bg-healthpal-card border border-healthpal-border rounded-lg p-3" 
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-8 bg-healthpal-green text-black font-semibold py-3 px-4 rounded-lg hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
        </div>
    </div>
  );
};

export default LoginPage;