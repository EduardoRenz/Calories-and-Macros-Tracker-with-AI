import React, { useRef, useMemo, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNavbar from './components/BottomNavbar';
import QuickMealModal from './components/QuickMealModal';
import ProtectedRoute from './components/ProtectedRoute';
import { LanguageProvider } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';
import InstallPWA from './components/InstallPWA';

// Lazy load pages
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const SettingsPage = React.lazy(() => import('./components/SettingsPage'));

type DashboardHandle = {
  refreshData: () => void;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const [isQuickMealOpen, setIsQuickMealOpen] = React.useState(false);
  const dashboardRef = useRef<DashboardHandle>(null);

  const handleQuickMealSuccess = () => {
    setIsQuickMealOpen(false);
    if (location.pathname === '/dashboard') {
      dashboardRef.current?.refreshData();
    }
  };

  // Only show navbar if user is authenticated, not loading, and not on login page
  const isLoginPage = location.pathname === '/login';
  const showNavbar = user && !loading && !isLoginPage;

  return (
    <LanguageProvider>
      <div className="bg-healthpal-dark min-h-screen text-healthpal-text-primary font-sans flex justify-center">
        <div className="w-full max-w-screen-2xl bg-healthpal-dark">
          {showNavbar && (
            <Navbar onQuickMealClick={() => setIsQuickMealOpen(true)} />
          )}
          <main className="p-6 lg:p-8 pb-24 md:pb-6 lg:pb-8">
            <Suspense fallback={
              <div className="flex items-center justify-center h-96">
                <p className="text-healthpal-text-secondary">Loading...</p>
              </div>
            }>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage ref={dashboardRef} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </main>
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
    </LanguageProvider>
  );
};

const App: React.FC = () => {
  const { user } = useAuth();

  // Memoize the repository factory initialization based on user state
  // This ensures repositories are created for the logged-in user
  useMemo(() => {
    if (user) {
      // Potentially re-initialize or pass user context to factories if needed
      // For now, our repositories get the user from firebase auth instance directly
    }
  }, [user]);

  return <AppContent />;
};

export default App;