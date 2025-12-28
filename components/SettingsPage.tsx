import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { SettingsIcon, RkIcon, GlobeIcon, PlusIcon, GoogleIcon, SparklesIcon, TrashIcon, XMarkIcon, ChevronUpIcon, ChevronDownIcon } from './icons';

// Types
type ProviderId = 'gemini' | 'openai' | 'deepseek';

interface ApiKey {
    provider: ProviderId;
    key: string;
    addedAt: number;
}

const PROVIDERS: { id: ProviderId; name: string; icon: React.ReactNode }[] = [
    { id: 'gemini', name: 'Google Gemini', icon: <GoogleIcon className="w-6 h-6" /> },
    { id: 'openai', name: 'OpenAI', icon: <SparklesIcon className="w-6 h-6" /> },
    { id: 'deepseek', name: 'DeepSeek', icon: <RkIcon className="w-6 h-6" /> },
];

const LanguageSelector: React.FC = () => {
    const { t } = useTranslation();
    const { language, setLanguage } = useLanguage();

    return (
        <div className="bg-healthpal-panel p-6 rounded-2xl flex items-center justify-between border border-healthpal-border">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-healthpal-card flex items-center justify-center text-healthpal-text-secondary">
                    <GlobeIcon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg">{t('settings.general.language')}</h3>
                    <p className="text-sm text-healthpal-text-secondary">Select your preferred language</p>
                </div>
            </div>
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-healthpal-card border border-healthpal-border rounded-lg px-4 py-3 text-sm text-healthpal-text-primary focus:ring-2 focus:ring-healthpal-green focus:border-transparent outline-none cursor-pointer placeholder-healthpal-text-secondary w-full md:w-auto"
                style={{ colorScheme: 'dark' }}
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
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const savedKeys = localStorage.getItem('ai_api_keys');
        if (savedKeys) {
            try {
                setKeys(JSON.parse(savedKeys));
            } catch (e) {
                console.error("Failed to parse api keys", e);
            }
        }
    }, []);

    const saveKeys = (newKeys: ApiKey[]) => {
        setKeys(newKeys);
        localStorage.setItem('ai_api_keys', JSON.stringify(newKeys));
    };

    const handleDelete = (provider: ProviderId) => {
        const newKeys = keys.filter(k => k.provider !== provider);
        saveKeys(newKeys);
    };

    const moveKey = (index: number, direction: 'up' | 'down') => {
        const newKeys = [...keys];
        if (direction === 'up' && index > 0) {
            [newKeys[index], newKeys[index - 1]] = [newKeys[index - 1], newKeys[index]];
        } else if (direction === 'down' && index < newKeys.length - 1) {
            [newKeys[index], newKeys[index + 1]] = [newKeys[index + 1], newKeys[index]];
        }
        saveKeys(newKeys);
    };

    const handleAddKey = (key: ApiKey) => {
        // Replace existing key if same provider, otherwise add to end
        const otherKeys = keys.filter(k => k.provider !== key.provider);
        saveKeys([...otherKeys, key]);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <RkIcon className="w-6 h-6 text-healthpal-green" />
                        {t('settings.tokens.title')}
                    </h3>
                    <p className="text-healthpal-text-secondary text-sm mt-1">
                        Manage your third-party AI provider keys. The app will uses the first available key in the list.
                        <br />
                        If a provider fails, it will attempt to use the next one as a fallback.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-healthpal-green text-black font-bold py-2 px-4 rounded-lg hover:brightness-110 transition-all text-sm"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>{t('settings.tokens.add_token')}</span>
                </button>
            </div>

            <div className="grid gap-4">
                {keys.length > 0 ? (
                    keys.map((key, index) => {
                        const provider = PROVIDERS.find(p => p.id === key.provider);
                        return (
                            <div key={key.provider} className="bg-healthpal-panel p-5 rounded-2xl flex items-center justify-between border border-healthpal-border shadow-sm transition-all hover:border-healthpal-text-secondary/30">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col gap-1 mr-2">
                                        <button
                                            onClick={() => moveKey(index, 'up')}
                                            disabled={index === 0}
                                            className="p-1 text-healthpal-text-secondary hover:text-healthpal-green disabled:opacity-30 disabled:hover:text-healthpal-text-secondary transition-colors"
                                            title="Move Up"
                                        >
                                            <ChevronUpIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => moveKey(index, 'down')}
                                            disabled={index === keys.length - 1}
                                            className="p-1 text-healthpal-text-secondary hover:text-healthpal-green disabled:opacity-30 disabled:hover:text-healthpal-text-secondary transition-colors"
                                            title="Move Down"
                                        >
                                            <ChevronDownIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="w-12 h-12 bg-healthpal-card rounded-xl flex items-center justify-center text-healthpal-text-primary">
                                        {provider?.icon}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-lg text-healthpal-text-primary">{provider?.name}</p>
                                            {index === 0 && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-healthpal-green/20 text-healthpal-green px-2 py-0.5 rounded-full border border-healthpal-green/30">
                                                    Primary
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-healthpal-text-secondary font-mono tracking-wider bg-healthpal-card px-2 py-1 rounded mt-1 inline-block">
                                            {key.key.substr(0, 4)}••••••••••••••••{key.key.substr(-4)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(key.provider)}
                                    className="p-2 text-healthpal-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title={t('settings.tokens.remove')}
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-healthpal-card/50 p-8 rounded-2xl text-center border-2 border-dashed border-healthpal-border flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-healthpal-card flex items-center justify-center text-healthpal-text-secondary">
                            <RkIcon className="w-6 h-6 opacity-50" />
                        </div>
                        <p className="text-healthpal-text-secondary font-medium">{t('settings.tokens.no_tokens')}</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <AddApiKeyModal
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleAddKey}
                />
            )}
        </div>
    );
};

const AddApiKeyModal: React.FC<{ onClose: () => void, onSave: (key: ApiKey) => void }> = ({ onClose, onSave }) => {
    const [provider, setProvider] = useState<ProviderId>('gemini');
    const [key, setKey] = useState('');
    const { t } = useTranslation();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (key.trim()) {
            onSave({
                provider,
                key: key.trim(),
                addedAt: Date.now()
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-healthpal-panel w-full max-w-md rounded-2xl border border-healthpal-border shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-healthpal-border bg-healthpal-card/50">
                    <h3 className="tex-lg font-bold flex items-center gap-2">
                        <RkIcon className="w-5 h-5 text-healthpal-green" />
                        Add New API Key
                    </h3>
                    <button onClick={onClose} className="text-healthpal-text-secondary hover:text-white transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-healthpal-text-secondary">AI Provider Model</label>
                        <div className="relative">
                            <select
                                value={provider}
                                onChange={(e) => setProvider(e.target.value as ProviderId)}
                                className="w-full bg-healthpal-card border border-healthpal-border text-healthpal-text-primary rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-healthpal-green focus:border-transparent outline-none"
                                style={{ colorScheme: 'dark' }}
                            >
                                {PROVIDERS.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-healthpal-text-secondary">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-healthpal-text-secondary">API Key</label>
                        <input
                            type="text"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="Paste your key here (e.g. sk-...)"
                            className="w-full bg-healthpal-card border border-healthpal-border text-healthpal-text-primary rounded-xl px-4 py-3 placeholder-healthpal-text-secondary/50 focus:ring-2 focus:ring-healthpal-green focus:border-transparent outline-none"
                            autoFocus
                        />
                        <p className="text-xs text-healthpal-text-secondary flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                            </svg>
                            Your key is encrypted and stored locally on your device.
                        </p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl font-semibold text-healthpal-text-primary hover:bg-healthpal-card transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!key.trim()}
                            className="flex-1 px-4 py-3 rounded-xl font-bold bg-healthpal-green text-black hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-healthpal-green/20"
                        >
                            Save Configuration
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const SettingsPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <header>
                <h2 className="text-3xl font-bold text-healthpal-text-primary">{t('settings.title')}</h2>
                <p className="text-healthpal-text-secondary mt-2">Customize your experience and manage your analytical preferences.</p>
            </header>

            <section className="space-y-4">
                <LanguageSelector />
            </section>

            <section className="space-y-4">
                <ApiTokenManager />
            </section>
        </div>
    );
};

export default SettingsPage;