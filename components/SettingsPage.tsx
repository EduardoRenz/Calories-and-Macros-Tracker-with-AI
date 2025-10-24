import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { SettingsIcon, RkIcon, HelpIcon, LogoutIcon, GlobeIcon, PlusIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC<{ activeTab: string, setActiveTab: (tab: string) => void }> = ({ activeTab, setActiveTab }) => {
    const { t } = useTranslation();
    const { user, signOut } = useAuth();

    const navItemClasses = "flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors";
    const activeClasses = "bg-healthpal-green text-black font-semibold";
    const inactiveClasses = "hover:bg-healthpal-card text-healthpal-text-secondary";

    const getInitials = (name: string | null | undefined) => {
        if (!name) return '';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    return (
        <aside className="w-full md:w-64 lg:w-72 bg-healthpal-panel rounded-2xl p-4 flex flex-col">
            <div className="flex items-center gap-4 p-2 mb-6">
                <div className="w-12 h-12 bg-healthpal-card rounded-full flex items-center justify-center border-2 border-healthpal-border overflow-hidden">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-bold text-healthpal-text-secondary">{getInitials(user?.displayName)}</span>
                    )}
                </div>
                <div>
                    <p className="font-bold text-healthpal-text-primary">{user?.displayName}</p>
                    <p className="text-sm text-healthpal-text-secondary">{user?.email}</p>
                </div>
            </div>
            <nav className="flex-grow space-y-2">
                <div
                    onClick={() => setActiveTab('general')}
                    className={`${navItemClasses} ${activeTab === 'general' ? activeClasses : inactiveClasses}`}
                >
                    <SettingsIcon className="w-6 h-6" />
                    <span>{t('settings.sidebar.general')}</span>
                </div>
                <div
                    onClick={() => setActiveTab('tokens')}
                    className={`${navItemClasses} ${activeTab === 'tokens' ? activeClasses : inactiveClasses}`}
                >
                    <RkIcon className="w-6 h-6" />
                    <span>{t('settings.sidebar.api_tokens')}</span>
                </div>
            </nav>
            <div className="mt-auto space-y-4">
                 <button 
                    onClick={signOut}
                    className="w-full bg-healthpal-card hover:bg-healthpal-border text-healthpal-text-secondary font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    <LogoutIcon className="w-5 h-5" />
                    <span>{t('settings.sidebar.logout')}</span>
                </button>
                <div className="flex justify-center items-center gap-6 text-sm text-healthpal-text-secondary">
                    <a href="#" className="flex items-center gap-1.5 hover:text-healthpal-text-primary">
                        <HelpIcon className="w-5 h-5" />
                        <span>{t('settings.sidebar.help')}</span>
                    </a>
                     <a href="#" className="flex items-center gap-1.5 hover:text-healthpal-text-primary">
                        <SettingsIcon className="w-5 h-5" />
                        <span>{t('settings.sidebar.settings')}</span>
                    </a>
                </div>
            </div>
        </aside>
    );
};

const LanguageSelector: React.FC = () => {
    const { t } = useTranslation();
    const { language, setLanguage } = useLanguage();

    return (
         <div className="bg-healthpal-panel p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
                <GlobeIcon className="w-6 h-6 text-healthpal-text-secondary" />
                <span className="font-medium">{t('settings.general.language')}</span>
            </div>
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-healthpal-card border border-healthpal-border rounded-lg p-2 text-sm text-healthpal-text-primary focus:ring-healthpal-green focus:border-healthpal-green"
            >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="pt">Português (Brasil)</option>
            </select>
        </div>
    )
}

const ApiTokenManager: React.FC = () => {
    const { t } = useTranslation();
    // FIX: Changed type to `React.ReactNode` to correctly reference React's JSX types and resolve the "Cannot find namespace 'JSX'" error.
    const tokens: { id: number; name: string; key: string; icon: React.ReactNode }[] = [];

    return (
        <div className="space-y-4">
            {tokens.length > 0 ? (
                tokens.map(token => (
                    <div key={token.id} className="bg-healthpal-panel p-4 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {token.icon}
                            <div>
                                <p className="font-semibold text-healthpal-text-primary">{token.name}</p>
                                <p className="text-sm text-healthpal-text-secondary font-mono tracking-wider">********************{token.key}</p>
                            </div>
                        </div>
                        <button className="text-sm bg-healthpal-card hover:bg-healthpal-border text-healthpal-text-secondary px-4 py-2 rounded-lg transition-colors">
                            {t('settings.tokens.remove')}
                        </button>
                    </div>
                ))
            ) : (
                <div className="bg-healthpal-panel p-8 rounded-2xl text-center text-healthpal-text-secondary border-2 border-dashed border-healthpal-border">
                    <p>{t('settings.tokens.no_tokens')}</p>
                </div>
            )}
        </div>
    );
};


const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('general');
    const { t } = useTranslation();

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="flex-1 bg-healthpal-panel rounded-2xl p-8">
                <h2 className="text-3xl font-bold">{t('settings.title')}</h2>
                <p className="text-healthpal-text-secondary mt-2 mb-8">{t('settings.subtitle')}</p>

                {activeTab === 'general' && (
                    <section className="mb-10">
                        <h3 className="text-xl font-bold mb-4">{t('settings.general.title')}</h3>
                        <LanguageSelector />
                    </section>
                )}
                
                {activeTab === 'tokens' && (
                    <section>
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="text-xl font-bold">{t('settings.tokens.title')}</h3>
                             <button className="flex items-center gap-2 bg-healthpal-green text-black font-bold py-2 px-4 rounded-lg hover:brightness-110 transition-all text-sm">
                                <PlusIcon className="w-5 h-5"/>
                                <span>{t('settings.tokens.add_token')}</span>
                            </button>
                        </div>
                        <ApiTokenManager />
                    </section>
                )}
            </main>
        </div>
    );
};

export default SettingsPage;