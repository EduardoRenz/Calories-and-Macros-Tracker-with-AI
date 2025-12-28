import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import type { Ingredient, MealSummary } from '../domain/entities/dashboard';
import { ServiceFactory } from '../data/ServiceFactory';
import { useLanguage } from '../contexts/LanguageContext';
import { SparklesIcon, SpinnerIcon } from './icons';

interface AddIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ingredient: Omit<Ingredient, 'id'>) => void;
  mealType: keyof MealSummary | null;
}

const initialFormState = {
  name: '',
  quantity: '',
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
};

const AddIngredientModal: React.FC<AddIngredientModalProps> = ({ isOpen, onClose, onSave, mealType }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [formState, setFormState] = useState(initialFormState);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [macroRatios, setMacroRatios] = useState<{ protein: number; carbs: number; fats: number } | null>(null);

  const nutritionService = useMemo(() => ServiceFactory.getNutritionAnalysisService(), []);

  useEffect(() => {
    if (isOpen) {
      setFormState(initialFormState);
      setMacroRatios(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const calories = (formState.protein * 4) + (formState.carbs * 4) + (formState.fats * 9);
    setFormState(prev => ({ ...prev, calories: Math.round(calories) }));
  }, [formState.protein, formState.carbs, formState.fats]);

  if (!isOpen || !mealType) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'quantity') {
      // Proportional updates if quantity changes
      setFormState(prev => ({ ...prev, quantity: value }));
      const quantityNum = parseFloat(value);
      if (!isNaN(quantityNum) && macroRatios) {
        setFormState(prev => ({
          ...prev,
          protein: Math.round(quantityNum * macroRatios.protein),
          carbs: Math.round(quantityNum * macroRatios.carbs),
          fats: Math.round(quantityNum * macroRatios.fats)
        }));
      }
    } else if (name === 'name') {
      setFormState(prev => ({ ...prev, name: value }));
    } else if (name !== 'calories') {
      // If macros change manually, update the ratios
      const numValue = parseFloat(value) || 0;
      setFormState(prev => ({ ...prev, [name]: numValue }));

      const currentQuantity = parseFloat(formState.quantity);
      if (!isNaN(currentQuantity) && currentQuantity > 0) {
        // We need to calculate ratios based on the NEW value for the changed field, and existing values for others
        const newMacros = {
          protein: name === 'protein' ? numValue : formState.protein,
          carbs: name === 'carbs' ? numValue : formState.carbs,
          fats: name === 'fats' ? numValue : formState.fats,
        };
        setMacroRatios({
          protein: newMacros.protein / currentQuantity,
          carbs: newMacros.carbs / currentQuantity,
          fats: newMacros.fats / currentQuantity
        });
      }
    }
  };

  const handleAnalyze = async () => {
    if (!formState.name || !formState.quantity) {
      // Maybe add a user-facing message here later
      return;
    }
    setIsAnalyzing(true);
    const result = await nutritionService.getNutritionalInfo(formState.name, formState.quantity, language);
    if (result) {
      const quantityInGrams = result.quantityInGrams || 100; // Default to 100 if not provided (shouldn't happen with new prompt)
      setFormState(prev => ({
        ...prev,
        quantity: `${quantityInGrams}g`,
        // calories is calculated via useEffect
        protein: Math.round(result.protein),
        carbs: Math.round(result.carbs),
        fats: Math.round(result.fats),
      }));

      // precise calculation of ratios
      setMacroRatios({
        protein: result.protein / quantityInGrams,
        carbs: result.carbs / quantityInGrams,
        fats: result.fats / quantityInGrams
      });
    } else {
      // Handle error state, e.g., show a toast notification
      alert(t('add_ingredient_modal.analysis_error'));
    }
    setIsAnalyzing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.name && formState.calories >= 0) {
      onSave(formState);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-healthpal-panel w-full max-w-md p-8 rounded-2xl border border-healthpal-border shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">{t('add_ingredient_modal.title')} {t(`meals.${mealType}`)}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-end gap-3">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !formState.name || !formState.quantity}
              className="p-3 bg-healthpal-green text-black rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('add_ingredient_modal.analyze_button_aria')}
            >
              {isAnalyzing ? <SpinnerIcon className="w-6 h-6" /> : <SparklesIcon className="w-6 h-6" />}
            </button>
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-healthpal-text-secondary mb-2">{t('add_ingredient_modal.name')}</label>
                <input type="text" name="name" value={formState.name} onChange={handleChange} required className="w-full bg-healthpal-card border border-healthpal-border rounded-lg p-3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-healthpal-text-secondary mb-2">{t('add_ingredient_modal.quantity')}</label>
                <input type="text" name="quantity" value={formState.quantity} onChange={handleChange} placeholder={t('add_ingredient_modal.quantity_placeholder')} className="w-full bg-healthpal-card border border-healthpal-border rounded-lg p-3" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-healthpal-text-secondary mb-2">{t('add_ingredient_modal.calories')}</label>
              <input type="number" step="any" min="0" name="calories" value={formState.calories} readOnly className="w-full bg-healthpal-card border border-healthpal-border rounded-lg p-3 opacity-70 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-healthpal-text-secondary mb-2">{t('add_ingredient_modal.protein')}</label>
              <input type="number" step="any" min="0" name="protein" value={formState.protein} onChange={handleChange} className="w-full bg-healthpal-card border border-healthpal-border rounded-lg p-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-healthpal-text-secondary mb-2">{t('add_ingredient_modal.carbs')}</label>
              <input type="number" step="any" min="0" name="carbs" value={formState.carbs} onChange={handleChange} className="w-full bg-healthpal-card border border-healthpal-border rounded-lg p-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-healthpal-text-secondary mb-2">{t('add_ingredient_modal.fats')}</label>
              <input type="number" step="any" min="0" name="fats" value={formState.fats} onChange={handleChange} className="w-full bg-healthpal-card border border-healthpal-border rounded-lg p-3" />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="bg-healthpal-card text-healthpal-text-primary font-bold py-2 px-4 rounded-lg hover:bg-healthpal-border transition-all">
              {t('add_ingredient_modal.cancel')}
            </button>
            <button type="submit" className="bg-healthpal-green text-black font-bold py-2 px-4 rounded-lg hover:brightness-110 transition-all">
              {t('add_ingredient_modal.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIngredientModal;