import React from 'react';
import { HealthPalLogo, SparklesIcon, SettingsIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
    currentPage: string;
    setCurrentPage: (page: string) => void;
    onQuickMealClick: () => void;
}

const NavLink: React.FC<{ pageName: string; currentPage: string; onClick: () => void; children: React.ReactNode }> = ({ pageName, currentPage, onClick, children }) => {
    const isActive = currentPage === pageName.toLowerCase();
    return (
        <button
            onClick={onClick}
            className={`py-1 text-md font-medium transition-colors ${
                isActive ? 'text-healthpal-green border-b-2 border-healthpal-green' : 'text-healthpal-text-secondary hover:text-healthpal-text-primary'
            }`}
        >
            {children}
        </button>
    );
};

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, onQuickMealClick }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navItems = ['Dashboard', 'Profile', 'Settings'];

    const getInitials = (name: string | null | undefined) => {
        if (!name) return '';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    return (
        <header className="flex justify-between items-center px-6 lg:px-8 pt-6 lg:pt-8 border-b border-healthpal-border pb-4">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                    <HealthPalLogo className="h-8 w-8 text-healthpal-green" />
                    <h1 className="text-2xl font-bold">CalorieApp</h1>
                </div>
                <nav className="hidden md:flex items-center gap-6">
                    {navItems.map(item => (
                        <NavLink key={item} pageName={item} currentPage={currentPage} onClick={() => setCurrentPage(item.toLowerCase())}>
                            {t(`navbar.${item.toLowerCase().replace(' ', '_')}`)}
                        </NavLink>
                    ))}
                </nav>
            </div>
            <div className="flex items-center gap-4">
                <button 
                    onClick={onQuickMealClick}
                    className="bg-healthpal-green text-black font-bold py-2 px-4 rounded-lg hover:brightness-110 transition-all text-sm hidden md:flex items-center gap-2"
                >
                    <SparklesIcon className="w-5 h-5"/>
                    <span>{t('navbar.quick_meal')}</span>
                </button>
                <button 
                    onClick={() => setCurrentPage('settings')}
                    className="p-2 rounded-full md:hidden text-healthpal-text-secondary hover:bg-healthpal-card"
                    aria-label={t('navbar.settings')}
                >
                    <SettingsIcon className="w-6 h-6"/>
                </button>
                <div className="w-10 h-10 bg-healthpal-card rounded-full flex items-center justify-center border-2 border-healthpal-border overflow-hidden">
                   {user?.photoURL ? (
                        <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                   ) : (
                        <span className="font-bold text-healthpal-text-secondary">{getInitials(user?.displayName)}</span>
                   )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;