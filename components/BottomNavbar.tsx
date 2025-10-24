import React from 'react';
import { HomeIcon, UserIcon, SparklesIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';

interface BottomNavbarProps {
    currentPage: string;
    setCurrentPage: (page: string) => void;
    onQuickMealClick: () => void;
}

const NavItem: React.FC<{
    pageName: string;
    label: string;
    icon: React.ReactNode;
    currentPage: string;
    onClick: () => void;
}> = ({ pageName, label, icon, currentPage, onClick }) => {
    const isActive = currentPage === pageName;
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-full h-full pt-1 transition-colors ${
                isActive ? 'text-healthpal-green' : 'text-healthpal-text-secondary hover:text-healthpal-text-primary'
            }`}
        >
            {icon}
            <span className="text-xs mt-1">{label}</span>
        </button>
    );
};

const BottomNavbar: React.FC<BottomNavbarProps> = ({ currentPage, setCurrentPage, onQuickMealClick }) => {
    const { t } = useTranslation();

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-healthpal-panel/80 backdrop-blur-sm border-t border-healthpal-border z-40">
            <nav className="flex items-center justify-around h-full max-w-md mx-auto px-2">
                <div className="w-1/3">
                    <NavItem
                        pageName="dashboard"
                        label={t('navbar.dashboard')}
                        icon={<HomeIcon className="w-6 h-6" />}
                        currentPage={currentPage}
                        onClick={() => setCurrentPage('dashboard')}
                    />
                </div>
                
                <div className="w-1/3" /> 

                <div className="w-1/3">
                    <NavItem
                        pageName="profile"
                        label={t('navbar.profile')}
                        icon={<UserIcon className="w-6 h-6" />}
                        currentPage={currentPage}
                        onClick={() => setCurrentPage('profile')}
                    />
                </div>
            </nav>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                 <button
                    onClick={onQuickMealClick}
                    className="w-16 h-16 bg-healthpal-green rounded-full flex items-center justify-center text-black shadow-lg shadow-black/30 hover:brightness-110 transition-all"
                    aria-label={t('navbar.quick_meal')}
                >
                    <SparklesIcon className="w-8 h-8"/>
                </button>
            </div>
        </div>
    );
};

export default BottomNavbar;
