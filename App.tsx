import React, { useState, useRef, useMemo } from 'react';
import Navbar from './components/Navbar';
import DashboardPage from './components/DashboardPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import QuickMealModal from './components/QuickMealModal';
import { LanguageProvider } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import { RepositoryFactory } from './data/RepositoryFactory';

type DashboardHandle = {
  refreshData: () => void;
};

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isQuickMealOpen, setIsQuickMealOpen] = useState(false);
  const dashboardRef = useRef<DashboardHandle>(null);

  const handleQuickMealSuccess = () => {
    setIsQuickMealOpen(false);
    if (currentPage === 'dashboard') {
      dashboardRef.current?.refreshData();
    }
  };
  
  // Memoize the repository factory initialization based on user state
  // This ensures repositories are created for the logged-in user
  useMemo(() => {
    if (user) {
      // Potentially re-initialize or pass user context to factories if needed
      // For now, our repositories get the user from firebase auth instance directly
    }
  }, [user]);

  if (loading) {
    return (
      <div className="bg-healthpal-dark min-h-screen flex items-center justify-center">
        <p className="text-healthpal-text-secondary">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <LanguageProvider>
      <div className="bg-healthpal-dark min-h-screen text-healthpal-text-primary font-sans flex justify-center">
        <div className="w-full max-w-screen-2xl bg-healthpal-dark">
          <Navbar 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
            onQuickMealClick={() => setIsQuickMealOpen(true)}
          />
          <main className="p-6 lg:p-8">
            {currentPage === 'dashboard' && <DashboardPage ref={dashboardRef} />}
            {currentPage === 'profile' && <ProfilePage />}
            {currentPage === 'settings' && <SettingsPage />}
            {(currentPage === 'food diary' || currentPage === 'reports') && (
               <div className="flex items-center justify-center h-96">
                  <h2 className="text-2xl text-healthpal-text-secondary">Page coming soon...</h2>
              </div>
            )}
          </main>
        </div>
      </div>
      <QuickMealModal 
        isOpen={isQuickMealOpen}
        onClose={() => setIsQuickMealOpen(false)}
        onSuccess={handleQuickMealSuccess}
      />
    </LanguageProvider>
  );
};

export default App;