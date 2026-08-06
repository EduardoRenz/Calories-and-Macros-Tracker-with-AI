'use client';

import React from 'react';
import Image from 'next/image';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { BreakfastIcon, LunchIcon, DinnerIcon } from '../FoodIcons';
import { LumiIcon, CheckCircleIcon } from '../icons';
import { useTranslation } from '../../hooks/useTranslation';

// ─── Static mock data ─────────────────────────────────────────────────────────

const MOCK_MACROS = {
  calories: { current: 1350, goal: 1800 },
  protein:  { current: 98,   goal: 130 },
  carbs:    { current: 145,  goal: 200 },
  fats:     { current: 42,   goal: 60  },
};

const PIE_DATA = [
  { name: 'Protein', value: MOCK_MACROS.protein.current,  color: 'var(--brand-protein)' },
  { name: 'Carbs',   value: MOCK_MACROS.carbs.current,    color: 'var(--brand-carbs)'   },
  { name: 'Fats',    value: MOCK_MACROS.fats.current,     color: 'var(--brand-fats)'    },
];

interface MockMacroBarProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  colorVar: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const MockMacroBar: React.FC<MockMacroBarProps> = ({ label, current, goal, unit, colorVar }) => {
  const pct = Math.min((current / goal) * 100, 100);
  return (
    <div className="bg-neutral-card px-3 py-2 rounded-xl">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-[10px] font-bold text-neutral-text-primary">{label}</span>
        <span className="text-[9px] text-neutral-text-secondary">{current}<span className="opacity-60">/{goal}{unit}</span></span>
      </div>
      <div className="relative w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `color-mix(in srgb, ${colorVar} 15%, transparent)` }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: colorVar }}
        />
      </div>
    </div>
  );
};

interface MockMealRowProps {
  icon: React.ReactNode;
  name: string;
  kcal: number;
  hasIngredient?: boolean;
}

const MockMealRow: React.FC<MockMealRowProps> = ({ icon, name, kcal, hasIngredient = true }) => (
  <div className={`bg-neutral-card rounded-xl px-3 py-2 flex items-center gap-2 ${hasIngredient ? 'border border-secondary/30' : ''}`}>
    <div className="bg-[#E9F7F5] dark:bg-surface-container-high p-1.5 rounded-lg text-brand-green dark:text-on-surface-variant flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-neutral-text-primary leading-tight truncate">{name}</p>
      <p className="text-[9px] text-neutral-text-secondary">{kcal} kcal</p>
    </div>
    {hasIngredient && (
      <CheckCircleIcon className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
    )}
  </div>
);

interface MockChatBubbleProps {
  isAssistant: boolean;
  text: string;
}

const MockChatBubble: React.FC<MockChatBubbleProps> = ({ isAssistant, text }) => (
  <div className={`flex items-end gap-1.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
    {isAssistant && (
      <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
        <LumiIcon className="w-full h-full" />
      </div>
    )}
    <div
      className={`max-w-[75%] px-2.5 py-1.5 rounded-2xl text-[9px] leading-relaxed shadow-sm ${
        isAssistant
          ? 'bg-neutral-card text-neutral-text-primary rounded-bl-sm border border-neutral-border'
          : 'bg-secondary text-on-secondary font-medium rounded-br-sm'
      }`}
    >
      {text}
    </div>
  </div>
);

// ─── Screen Views ─────────────────────────────────────────────────────────────

const DashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const caloriesRemaining = MOCK_MACROS.calories.goal - MOCK_MACROS.calories.current;
  const caloriePct = Math.round((MOCK_MACROS.calories.current / MOCK_MACROS.calories.goal) * 100);

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Donut Chart */}
      <div className="bg-neutral-card rounded-2xl p-2 flex gap-2 items-center">
        <div className="relative w-20 h-20 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={PIE_DATA}
                cx="50%"
                cy="50%"
                innerRadius="62%"
                outerRadius="95%"
                paddingAngle={3}
                dataKey="value"
                cornerRadius={4}
                startAngle={90}
                endAngle={-270}
              >
                {PIE_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] text-neutral-text-secondary leading-none">{t('dashboard.calories') || 'Calorias'}</span>
            <span className="text-sm font-bold text-neutral-text-primary leading-tight">{caloriePct}%</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex justify-between items-baseline">
            <span className="text-[9px] text-neutral-text-secondary">{t('dashboard.calories_remaining') || 'Restantes'}</span>
            <span className="text-xs font-bold text-secondary">{caloriesRemaining}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-neutral-panel overflow-hidden">
            <div
              className="h-full rounded-full bg-secondary transition-all duration-700"
              style={{ width: `${caloriePct}%` }}
            />
          </div>
          <p className="text-[8px] text-neutral-text-secondary">{MOCK_MACROS.calories.current} / {MOCK_MACROS.calories.goal} kcal</p>
        </div>
      </div>

      {/* Macro bars */}
      <div className="flex flex-col gap-1">
        <MockMacroBar label={t('dashboard.protein') || 'Proteína'} current={MOCK_MACROS.protein.current} goal={MOCK_MACROS.protein.goal} unit="g" colorVar="var(--brand-protein)" />
        <MockMacroBar label={t('dashboard.carbs')   || 'Carbs'}    current={MOCK_MACROS.carbs.current}   goal={MOCK_MACROS.carbs.goal}   unit="g" colorVar="var(--brand-carbs)"   />
        <MockMacroBar label={t('dashboard.fats')    || 'Gorduras'}  current={MOCK_MACROS.fats.current}    goal={MOCK_MACROS.fats.goal}    unit="g" colorVar="var(--brand-fats)"    />
      </div>

      {/* Meals */}
      <div className="flex flex-col gap-1 flex-1">
        <p className="text-[9px] font-bold text-neutral-text-secondary uppercase tracking-wider px-0.5">{t('dashboard.today_meals')}</p>
        <MockMealRow icon={<BreakfastIcon className="w-3.5 h-3.5" />} name={t('meals.breakfast') || 'Café da manhã'} kcal={420} hasIngredient />
        <MockMealRow icon={<LunchIcon    className="w-3.5 h-3.5" />} name={t('meals.lunch')     || 'Almoço'}        kcal={630} hasIngredient />
        <MockMealRow icon={<DinnerIcon   className="w-3.5 h-3.5" />} name={t('meals.dinner')    || 'Jantar'}        kcal={300} hasIngredient={false} />
      </div>
    </div>
  );
};

const ChatScreen: React.FC = () => {
  const { t } = useTranslation();

  const messages = [
    { isAssistant: true,  text: t('landing.hero.mock_chat_1') || 'Olá! O que você comeu hoje?' },
    { isAssistant: false, text: t('landing.hero.mock_chat_2') || 'Frango grelhado 200g e arroz' },
    { isAssistant: true,  text: t('landing.hero.mock_chat_3') || '✅ Adicionado ao almoço! 630 kcal, 48g de proteína.' },
  ];

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex flex-col gap-2 flex-1 justify-end">
        {messages.map((msg, i) => (
          <MockChatBubble key={i} isAssistant={msg.isAssistant} text={msg.text} />
        ))}
      </div>
      {/* Input bar */}
      <div className="bg-neutral-card rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 border border-neutral-border">
        <span className="flex-1 text-[9px] text-neutral-text-secondary">
          {t('landing.hero.mock_chat_placeholder') || 'Descreva sua refeição...'}
        </span>
        <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-3 h-3 fill-on-secondary">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// ─── Phone Mockup Shell ───────────────────────────────────────────────────────

interface PhoneScreenProps {
  activeTab: 'dashboard' | 'chat';
  onTabChange: (tab: 'dashboard' | 'chat') => void;
}

const PhoneScreen: React.FC<PhoneScreenProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();

  return (
    <div className="relative w-full h-full flex flex-col bg-surface overflow-hidden">
      {/* Status bar */}
      <div className="flex justify-between items-center px-4 pt-2 pb-1 bg-surface z-10 flex-shrink-0">
        <span className="text-[8px] font-bold text-neutral-text-primary">9:41</span>
        <div className="flex gap-1">
          <div className="w-3 h-1.5 rounded-sm bg-secondary opacity-80" />
          <div className="w-1 h-1.5 rounded-sm bg-neutral-text-secondary opacity-40" />
        </div>
      </div>

      {/* App header */}
      <div className="flex justify-between items-center px-4 py-1.5 bg-surface flex-shrink-0 border-b border-neutral-border/10">
        <div className="flex items-center gap-1.5">
          <Image src="/Icon.svg" alt="Levemente Logo" width={16} height={16} className="w-4 h-4 object-contain" />
          <span className="text-xs font-bold text-primary">Levemente</span>
        </div>
        <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center">
          <span className="text-[8px] font-bold text-on-primary-container">E</span>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex mx-4 mb-2 bg-neutral-panel rounded-xl p-0.5 flex-shrink-0">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex-1 text-[9px] font-semibold py-1 rounded-lg transition-all duration-200 ${
            activeTab === 'dashboard'
              ? 'bg-surface text-primary shadow-sm'
              : 'text-neutral-text-secondary'
          }`}
        >
          {t('landing.hero.tab_dashboard') || 'Dashboard'}
        </button>
        <button
          onClick={() => onTabChange('chat')}
          className={`flex-1 text-[9px] font-semibold py-1 rounded-lg transition-all duration-200 ${
            activeTab === 'chat'
              ? 'bg-surface text-primary shadow-sm'
              : 'text-neutral-text-secondary'
          }`}
        >
          {t('landing.hero.tab_chat') || 'Chat IA'}
        </button>
      </div>

      {/* Screen content */}
      <div className="flex-1 overflow-hidden px-4 pb-2 min-h-0">
        <div
          className="h-full transition-all duration-500"
          style={{ opacity: 1 }}
          key={activeTab}
        >
          {activeTab === 'dashboard' ? <DashboardScreen /> : <ChatScreen />}
        </div>
      </div>

      {/* Bottom nav bar */}
      <div className="flex justify-around items-center py-2 px-4 bg-surface border-t border-neutral-border flex-shrink-0">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center gap-0.5 transition-colors ${activeTab === 'dashboard' ? 'text-primary' : 'text-neutral-text-secondary'}`}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="text-[7px]">{t('navbar.dashboard')}</span>
        </button>
        <button
          onClick={() => onTabChange('chat')}
          className={`flex flex-col items-center gap-0.5 transition-colors ${activeTab === 'chat' ? 'text-primary' : 'text-neutral-text-secondary'}`}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
          <span className="text-[7px]">{t('landing.hero.tab_chat')}</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 text-neutral-text-secondary">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          </svg>
          <span className="text-[7px]">{t('navbar.profile')}</span>
        </button>
      </div>
    </div>
  );
};

// ─── Main export ──────────────────────────────────────────────────────────────

export const HeroAppPreview: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'chat'>('dashboard');

  // Auto-switch tabs to show both features
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab(prev => prev === 'dashboard' ? 'chat' : 'dashboard');
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="relative mx-auto"
      style={{ width: '240px', height: '490px' }}
      aria-label="Levemente app preview"
    >
      {/* Phone bezel */}
      <div
        className="absolute inset-0 rounded-[3rem] shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          padding: '3px',
        }}
      >
        {/* Inner screen area */}
        <div className="w-full h-full rounded-[2.7rem] overflow-hidden bg-surface flex flex-col">
          {/* Notch / dynamic island */}
          <div className="flex justify-center pt-2 pb-0 flex-shrink-0">
            <div className="w-20 h-4 bg-neutral-text-primary/90 rounded-full" />
          </div>
          {/* App content */}
          <div className="flex-1 overflow-hidden min-h-0">
            <PhoneScreen activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          {/* Home indicator */}
          <div className="flex justify-center pb-1.5 pt-0.5 flex-shrink-0">
            <div className="w-16 h-1 bg-neutral-text-primary/20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
