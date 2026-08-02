'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { CalorieCalculationService } from '@/domain/services/CalorieCalculationService';
import { useTranslation } from '@/hooks/useTranslation';
import type { PersonalInfo, FitnessGoals } from '@/domain/entities/profile';

type Gender = 'male' | 'female' | 'other';
type ActivityLevel = 'sedentary' | 'lightly' | 'moderately' | 'very';
type Goal = 'lose' | 'maintain' | 'gain';

interface FormState {
  age: string;
  weight: string;
  height: string;
  gender: Gender | '';
  activityLevel: ActivityLevel | '';
  goal: Goal | '';
}

interface Result {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const initialForm: FormState = {
  age: '',
  weight: '',
  height: '',
  gender: '',
  activityLevel: '',
  goal: '',
};

function buildProfile(form: FormState) {
  const personalInfo: PersonalInfo = {
    age: form.age ? Number(form.age) : null,
    weight: form.weight ? Number(form.weight) : null,
    height: form.height ? Number(form.height) : null,
    gender: (form.gender || null) as PersonalInfo['gender'],
  };
  const fitnessGoals: FitnessGoals = {
    primaryGoal: (form.goal || null) as FitnessGoals['primaryGoal'],
    targetWeight: null,
    activityLevel: (form.activityLevel || null) as FitnessGoals['activityLevel'],
  };
  return {
    name: '',
    email: '',
    personalInfo,
    fitnessGoals,
    weightHistory: [],
    healthConditions: { selected: [] },
  };
}

function MacroBar({ label, value, unit, color, max }: { label: string; value: number; unit: string; color: string; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span>
          {value}{unit}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-neutral-border">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

const INPUT_CLASS = 'w-full rounded-lg border border-neutral-border bg-neutral-panel p-3 placeholder:text-on-surface/30';
const SELECT_CLASS = 'w-full rounded-lg border border-neutral-border bg-neutral-panel p-3 placeholder:text-on-surface/30';
const ERROR_INPUT_CLASS = 'w-full rounded-lg border border-red-500 bg-neutral-panel p-3 placeholder:text-on-surface/30';
const ERROR_SELECT_CLASS = 'w-full rounded-lg border border-red-500 bg-neutral-panel p-3 placeholder:text-on-surface/30';

export default function CalculatorForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('calculator_form_data');
        if (saved) {
          sessionStorage.removeItem('calculator_form_data');
          return JSON.parse(saved) as FormState;
        }
      } catch { /* ignore */ }
    }
    return initialForm;
  });
  const [result, setResult] = useState<Result | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const goalLabels = useMemo<Record<Goal, string>>(() => ({
    lose: t('calculator.lose_weight'),
    maintain: t('calculator.maintain_weight'),
    gain: t('calculator.gain_muscle'),
  }), [t]);

  const activityLabels = useMemo<Record<ActivityLevel, string>>(() => ({
    sedentary: t('calculator.sedentary'),
    lightly: t('calculator.lightly_active'),
    moderately: t('calculator.moderately_active'),
    very: t('calculator.very_active'),
  }), [t]);

  const fieldErrors_i18n = useMemo(() => ({
    age: t('calculator.error_age'),
    weight: t('calculator.error_weight'),
    height: t('calculator.error_height'),
    gender: t('calculator.error_gender'),
    activityLevel: t('calculator.error_activity'),
    goal: t('calculator.error_goal'),
  }), [t]);

  const ageRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);
  const heightRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLSelectElement>(null);
  const activityRef = useRef<HTMLSelectElement>(null);
  const goalRef = useRef<HTMLSelectElement>(null);

  const fieldRefs = useRef<Record<string, React.RefObject<HTMLInputElement | HTMLSelectElement | null>>>({
    age: ageRef,
    weight: weightRef,
    height: heightRef,
    gender: genderRef,
    activityLevel: activityRef,
    goal: goalRef,
  });

  const updateField = useCallback(
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setResult(null);
        setFieldErrors((prev) => {
          if (!prev[field]) return prev;
          const next = { ...prev };
          delete next[field];
          return next;
        });
      },
    []
  );

  const handleCalculate = useCallback(() => {
    const errors: Record<string, string> = {};
    const fieldOrder: (keyof FormState)[] = ['age', 'weight', 'height', 'gender', 'activityLevel', 'goal'];

    for (const field of fieldOrder) {
      if (!form[field]) {
        errors[field] = fieldErrors_i18n[field as keyof typeof fieldErrors_i18n];
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstMissing = fieldOrder.find((f) => !form[f]);
      if (firstMissing && fieldRefs.current[firstMissing]?.current) {
        fieldRefs.current[firstMissing].current!.focus();
      }
      return;
    }

    setFieldErrors({});
    const profile = buildProfile(form);

    const goals = CalorieCalculationService.calculateGoals(profile);
    if (!goals) {
      setFieldErrors({ age: t('calculator.error_calculate') });
      return;
    }

    setResult(goals);
  }, [form, fieldErrors_i18n, t]);

  const maxMacro = result ? Math.max(result.protein, result.carbs, result.fats, 1) : 1;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-border bg-neutral-card p-6">
        <h2 className="mb-4 text-lg font-semibold">{t('calculator.section_data')}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">{t('calculator.age')}</label>
            <input
              ref={ageRef}
              type="number"
              value={form.age}
              onChange={updateField('age')}
              placeholder="30"
              className={fieldErrors.age ? ERROR_INPUT_CLASS : INPUT_CLASS}
            />
            {fieldErrors.age && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.age}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">{t('calculator.weight')}</label>
            <input
              ref={weightRef}
              type="number"
              value={form.weight}
              onChange={updateField('weight')}
              placeholder="70"
              className={fieldErrors.weight ? ERROR_INPUT_CLASS : INPUT_CLASS}
            />
            {fieldErrors.weight && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.weight}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">{t('calculator.height')}</label>
            <input
              ref={heightRef}
              type="number"
              value={form.height}
              onChange={updateField('height')}
              placeholder="170"
              className={fieldErrors.height ? ERROR_INPUT_CLASS : INPUT_CLASS}
            />
            {fieldErrors.height && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.height}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">{t('calculator.gender')}</label>
            <select
              ref={genderRef}
              value={form.gender}
              onChange={updateField('gender')}
              aria-label={t('calculator.gender')}
              className={fieldErrors.gender ? ERROR_SELECT_CLASS : SELECT_CLASS}
            >
              <option value="">{t('calculator.select')}</option>
              <option value="male">{t('calculator.male')}</option>
              <option value="female">{t('calculator.female')}</option>
              <option value="other">{t('calculator.other')}</option>
            </select>
            {fieldErrors.gender && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.gender}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">{t('calculator.activity_level')}</label>
            <select
              ref={activityRef}
              value={form.activityLevel}
              onChange={updateField('activityLevel')}
              aria-label={t('calculator.activity_level')}
              className={fieldErrors.activityLevel ? ERROR_SELECT_CLASS : SELECT_CLASS}
            >
              <option value="">{t('calculator.select')}</option>
              {(Object.entries(activityLabels) as [ActivityLevel, string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            {fieldErrors.activityLevel && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.activityLevel}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">{t('calculator.goal')}</label>
            <select
              ref={goalRef}
              value={form.goal}
              onChange={updateField('goal')}
              aria-label={t('calculator.goal')}
              className={fieldErrors.goal ? ERROR_SELECT_CLASS : SELECT_CLASS}
            >
              <option value="">{t('calculator.select')}</option>
              {(Object.entries(goalLabels) as [Goal, string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            {fieldErrors.goal && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.goal}</p>
            )}
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="mt-6 w-full rounded-xl bg-brand-primary py-3 font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          {t('calculator.calculate')}
        </button>
      </div>

      {result && (
        <div className="rounded-2xl border border-neutral-border bg-neutral-card p-6">
          <h2 className="mb-4 text-center text-lg font-semibold">{t('calculator.results_title')}</h2>

          <div className="mb-6 text-center">
            <p className="text-sm text-on-surface-variant">{t('calculator.calories')}</p>
            <p className="text-4xl font-bold text-brand-primary">{result.calories}</p>
            <p className="text-sm text-on-surface-variant">{t('calculator.kcal')}</p>
          </div>

          <div className="space-y-4">
            <MacroBar label={t('calculator.protein')} value={result.protein} unit="g" color="var(--brand-protein, #ef4444)" max={maxMacro} />
            <MacroBar label={t('calculator.carbs')} value={result.carbs} unit="g" color="var(--brand-carbs, #f59e0b)" max={maxMacro} />
            <MacroBar label={t('calculator.fats')} value={result.fats} unit="g" color="var(--brand-fats, #3b82f6)" max={maxMacro} />
          </div>

          <a
            href="/login"
            onClick={() => {
              sessionStorage.setItem('calculator_form_data', JSON.stringify(form));
              sessionStorage.setItem('login_redirect', '/profile');
            }}
            className="mt-6 block w-full rounded-xl bg-green-600 py-3 text-center font-semibold text-white transition-opacity hover:opacity-90"
          >
            {t('calculator.cta')}
          </a>
        </div>
      )}
    </div>
  );
}
