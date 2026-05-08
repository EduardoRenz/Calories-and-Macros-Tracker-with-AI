import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import type { Ingredient, MealSummary } from '../domain/entities/dashboard';
import { ServiceFactory } from '../data/ServiceFactory';
import { useLanguage } from '../contexts/LanguageContext';
import { useFeatureFlags } from '../contexts/FeatureFlagContext';
import { SparklesIcon, SpinnerIcon } from './icons';
import Modal from './ui/Modal';
import { AiAccessException, AiDisabledException, PremiumOnlyException, ApiKeysRequiredException } from '../domain/exceptions/AiAccessException';
import MarkdownRenderer from './assistant/MarkdownRenderer';

interface AddIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ingredient: Omit<Ingredient, 'id'>) => void;
  mealType: keyof MealSummary | null;
}

const initialFormState = {
  name: '',
  quantity: '',
  calories: '',
  protein: '',
  carbs: '',
  fats: '',
  fiber: '',
  category: '',
};

const AddIngredientModal: React.FC<AddIngredientModalProps> = ({ isOpen, onClose, onSave, mealType }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [formState, setFormState] = useState(initialFormState);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [macroRatios, setMacroRatios] = useState<{ protein: number; carbs: number; fats: number; fiber: number } | null>(null);
  const [detectedCategory, setDetectedCategory] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (isOpen) {
      setFormState(initialFormState);
      setMacroRatios(null);
      setError(null);
      setDetectedCategory('');
    }
  }, [isOpen]);

  useEffect(() => {
    const protein = parseFloat(formState.protein) || 0;
    const carbs = parseFloat(formState.carbs) || 0;
    const fats = parseFloat(formState.fats) || 0;
    const calories = (protein * 4) + (carbs * 4) + (fats * 9);
    setFormState(prev => ({ ...prev, calories: calories > 0 ? Math.round(calories).toString() : '' }));
  }, [formState.protein, formState.carbs, formState.fats]);

  if (!mealType) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'quantity') {
      // Proportional updates if quantity changes
      const quantityNum = parseFloat(value);
      if (!isNaN(quantityNum) && macroRatios) {
        setFormState(prev => ({
          ...prev,
          quantity: value,
          protein: Math.round(quantityNum * macroRatios.protein).toString(),
          carbs: Math.round(quantityNum * macroRatios.carbs).toString(),
          fats: Math.round(quantityNum * macroRatios.fats).toString(),
          fiber: Math.round(quantityNum * macroRatios.fiber).toString(),
        }));
      } else {
        setFormState(prev => ({ ...prev, quantity: value }));
      }
    } else if (name === 'name') {
      setFormState(prev => ({ ...prev, name: value }));
    } else if (name !== 'calories') {
      // If macros change manually, update the ratios
      setFormState(prev => ({ ...prev, [name]: value }));

      const numValue = parseFloat(value) || 0;
      const currentQuantity = parseFloat(formState.quantity);
      if (!isNaN(currentQuantity) && currentQuantity > 0) {
        // We need to calculate ratios based on the NEW value for the changed field, and existing values for others
        const newMacros = {
          protein: name === 'protein' ? numValue : parseFloat(formState.protein) || 0,
          carbs: name === 'carbs' ? numValue : parseFloat(formState.carbs) || 0,
          fats: name === 'fats' ? numValue : parseFloat(formState.fats) || 0,
          fiber: parseFloat(formState.fiber) || 0,
        };
        setMacroRatios({
          protein: newMacros.protein / currentQuantity,
          carbs: newMacros.carbs / currentQuantity,
          fats: newMacros.fats / currentQuantity,
          fiber: newMacros.fiber / currentQuantity,
        });
      }
    }
  };

  const handleAnalyze = async () => {
    if (!formState.name || !formState.quantity) {
      setError(t('add_ingredient_modal.name_required'));
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    try {
      const aiAccessService = ServiceFactory.getAiAccessService();
      await aiAccessService.checkAccess('ingredient_search');

      const nutritionService = await ServiceFactory.getNutritionAnalysisService();
      const result = await nutritionService.getNutritionalInfo(formState.name, formState.quantity, language);
      if (result) {
        const quantityInGrams = result.quantityInGrams || 100; // Default to 100 if not provided (shouldn't happen with new prompt)
        const fiber = typeof result.fiber === 'number' ? result.fiber : 0;
        const category = result.category || 'others';
        setDetectedCategory(category);
        setFormState(prev => ({
          ...prev,
          quantity: `${quantityInGrams}g`,
          // calories is calculated via useEffect
          protein: Math.round(result.protein).toString(),
          carbs: Math.round(result.carbs).toString(),
          fats: Math.round(result.fats).toString(),
          fiber: Math.round(fiber).toString(),
        }));

        // precise calculation of ratios
        setMacroRatios({
          protein: result.protein / quantityInGrams,
          carbs: result.carbs / quantityInGrams,
          fats: result.fats / quantityInGrams,
          fiber: fiber / quantityInGrams,
        });
      } else {
        setError(t('add_ingredient_modal.analysis_error'));
      }
    } catch (err) {
      if (err instanceof AiAccessException) {
        if (err instanceof AiDisabledException) {
          setError(t('ai_errors.disabled'));
        } else if (err instanceof PremiumOnlyException) {
          setError(t('ai_errors.premium_required'));
        } else if (err instanceof ApiKeysRequiredException) {
          setError(t('ai_errors.api_keys_required'));
        } else {
          setError(t('add_ingredient_modal.analysis_error'));
        }
      } else {
        const message = err instanceof Error ? err.message : String(err);
        
        if (message.includes('Premium') || message.includes('premium') || 
            message.includes('API key') || message.includes('api_key') || message.includes('API Key')) {
          
          const aiAccessService = ServiceFactory.getAiAccessService();
          const minPlan = await aiAccessService.getMinPlan('ingredient_search');
          
          if (minPlan === 'premium') {
            setError(t('ai_errors.premium_required'));
          } else {
            setError(t('ai_errors.api_keys_required'));
          }
        } else {
          setError(t('add_ingredient_modal.analysis_error'));
        }
      }
    }
    setIsAnalyzing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);

    if (!formState.name) {
      setError(t('add_ingredient_modal.name_required'));
      return;
    }

    // Check if macros are filled (not empty or NaN)
    const protein = parseFloat(formState.protein);
    const carbs = parseFloat(formState.carbs);
    const fats = parseFloat(formState.fats);
    const fiber = parseFloat(formState.fiber) || 0;
    const calories = parseFloat(formState.calories) || 0;

    if (isNaN(protein) || isNaN(carbs) || isNaN(fats)) {
      setError(t('add_ingredient_modal.macros_required'));
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: formState.name,
        quantity: formState.quantity,
        calories,
        protein,
        carbs,
        fats,
        fiber,
        category: detectedCategory || 'others',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      showCloseButton
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('add_ingredient_modal.title')} ${t(`meals.${mealType}`)}`}
      size="xl"
      dataTestId="add-ingredient-modal"
      bodyClassName="p-8"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-end gap-3">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !formState.name || !formState.quantity}
            className="p-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-secondary text-on-secondary hover:brightness-110"
            aria-label={t('add_ingredient_modal.analyze_button_aria')}
            data-testid="analyze-button"
          >
            {isAnalyzing ? <SpinnerIcon className="w-6 h-6" /> : <SparklesIcon className="w-6 h-6" />}
          </button>
          <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-text-secondary mb-2">{t('add_ingredient_modal.name')}</label>
              <input type="text" name="name" value={formState.name} onChange={handleChange} required className="w-full bg-neutral-card border border-neutral-border rounded-lg p-3" data-testid="ingredient-name-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text-secondary mb-2">{t('add_ingredient_modal.quantity')}</label>
              <input type="text" name="quantity" value={formState.quantity} onChange={handleChange} placeholder={t('add_ingredient_modal.quantity_placeholder')} className="w-full bg-neutral-card border border-neutral-border rounded-lg p-3" data-testid="ingredient-quantity-input" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-text-secondary mb-2">{t('add_ingredient_modal.calories')}</label>
            <input type="text" name="calories" value={formState.calories} readOnly className="w-full bg-neutral-card border border-neutral-border rounded-lg p-3 opacity-70 cursor-not-allowed" data-testid="ingredient-calories-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-text-secondary mb-2">{t('add_ingredient_modal.fiber')}</label>
            <input type="text" name="fiber" value={formState.fiber} readOnly className="w-full bg-neutral-card border border-neutral-border rounded-lg p-3 opacity-70 cursor-not-allowed" data-testid="ingredient-fiber-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-text-secondary mb-2">{t('add_ingredient_modal.protein')}</label>
            <input type="text" name="protein" value={formState.protein} onChange={handleChange} className="w-full bg-neutral-card border border-neutral-border rounded-lg p-3" data-testid="ingredient-protein-input" placeholder="" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-text-secondary mb-2">{t('add_ingredient_modal.carbs')}</label>
            <input type="text" name="carbs" value={formState.carbs} onChange={handleChange} className="w-full bg-neutral-card border border-neutral-border rounded-lg p-3" data-testid="ingredient-carbs-input" placeholder="" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-text-secondary mb-2">{t('add_ingredient_modal.fats')}</label>
            <input type="text" name="fats" value={formState.fats} onChange={handleChange} className="w-full bg-neutral-card border border-neutral-border rounded-lg p-3" data-testid="ingredient-fats-input" placeholder="" />
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm">
            <MarkdownRenderer content={error} />
          </div>
        )}

        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="bg-neutral-card text-neutral-text-primary font-bold py-2 px-4 rounded-lg hover:bg-neutral-border transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {t('add_ingredient_modal.cancel')}
          </button>
          <button type="submit" disabled={isSubmitting} className="bg-secondary text-on-secondary font-bold py-2 px-4 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" data-testid="save-ingredient-button">
            {isSubmitting ? <SpinnerIcon className="w-5 h-5" /> : null}
            {t('add_ingredient_modal.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddIngredientModal;
