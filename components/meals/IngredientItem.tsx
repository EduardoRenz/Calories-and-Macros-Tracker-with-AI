import React, { useState, useEffect, useRef } from 'react';
import { Meal, Ingredient } from '@/domain/entities/dashboard';
import { TrashIcon } from '../icons';
import { useTranslation } from '@/hooks/useTranslation';
import { MeatsIcon, FruitsIcon, PastaIcon, OthersIcon, EggsIcon, VegetablesIcon, CerealsIcon, CandiesIcon, MilkIcon, SeasoningIcon } from '../FoodIcons';

interface IngredientItemProps {
    ingredient: Meal['ingredients'][0];
    onRemove: (id: string) => void;
    onUpdate: (ingredientId: string, updates: Partial<Ingredient>) => void;
}

const CategoryIcon = ({ category, className }: { category?: string; className?: string }) => {
    switch (category) {
        case 'meats': return <MeatsIcon className={className} />;
        case 'eggs': return <EggsIcon className={className} />;
        case 'fruits': return <FruitsIcon className={className} />;
        case 'vegetables': return <VegetablesIcon className={className} />;
        case 'pasta': return <PastaIcon className={className} />;
        case 'cereals': return <CerealsIcon className={className} />;
        case 'candies': return <CandiesIcon className={className} />;
        case 'milk': return <MilkIcon className={className} />;
        case 'seasonings': return <SeasoningIcon className={className} />;
        default: return <OthersIcon className={className} />;
    }
};

export const IngredientItem: React.FC<IngredientItemProps> = ({ ingredient, onRemove, onUpdate }) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(ingredient.quantity);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleStartEditing = () => {
        setIsEditing(true);
        setEditValue(ingredient.quantity);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditValue(ingredient.quantity);
    };

    const calculateProportionalMacros = (newQuantityStr: string): Partial<Ingredient> | null => {
        const newQuantity = parseFloat(newQuantityStr);
        const oldQuantity = parseFloat(ingredient.quantity);

        if (isNaN(newQuantity) || isNaN(oldQuantity) || oldQuantity <= 0) return null;

        const ratio = newQuantity / oldQuantity;

        const protein = Math.round(ingredient.protein * ratio);
        const carbs = Math.round(ingredient.carbs * ratio);
        const fats = Math.round(ingredient.fats * ratio);
        const fiber = Math.round(ingredient.fiber * ratio);
        const calories = Math.round((protein * 4) + (carbs * 4) + (fats * 9));

        return {
            quantity: newQuantityStr.includes('g') ? `${newQuantity}g` : `${newQuantity}g`,
            protein,
            carbs,
            fats,
            fiber,
            calories
        };
    };

    const handleSave = () => {
        if (editValue === ingredient.quantity) {
            setIsEditing(false);
            return;
        }

        const updates = calculateProportionalMacros(editValue);
        if (updates) {
            onUpdate(ingredient.id, updates);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    return (
        <li className="group py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-grow">
                <div className="hidden md:flex p-2 bg-slate-50 dark:bg-surface-container-high text-slate-400 dark:text-on-surface-variant rounded-xl">
                    <CategoryIcon category={ingredient.category} className="w-5 h-5 text-current" />
                </div>
                <div className="flex flex-col">
                    <span className="text-neutral-text-primary font-bold leading-snug">{ingredient.name}</span>
                    <div className="flex items-center gap-1 text-xs text-neutral-text-secondary">
                        {isEditing ? (
                            <input
                                ref={inputRef}
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={handleSave}
                                onKeyDown={handleKeyDown}
                                className="bg-neutral-card border border-brand-green rounded px-1 w-12 focus:outline-none"
                            />
                        ) : (
                            <span onClick={handleStartEditing} className="cursor-pointer hover:underline decoration-dotted">
                                {ingredient.quantity}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex flex-col items-center min-w-[3ch]">
                    <span className="text-brand-protein font-bold text-sm">{ingredient.protein}g</span>
                    <span className="text-[10px] text-neutral-text-secondary uppercase">P</span>
                </div>
                <div className="flex flex-col items-center min-w-[3ch]">
                    <span className="text-brand-carbs font-bold text-sm">{ingredient.carbs}g</span>
                    <span className="text-[10px] text-neutral-text-secondary uppercase">C</span>
                </div>
                <div className="flex flex-col items-center min-w-[3ch]">
                    <span className="text-brand-fats font-bold text-sm">{ingredient.fats}g</span>
                    <span className="text-[10px] text-neutral-text-secondary uppercase">{t('meals.fats_abbr')}</span>
                </div>

                {/* Calories hidden to match screenshot, but can be added back if needed */}
                <div className="hidden md:flex flex-col items-center min-w-[4ch] opacity-50">
                    <span className="text-neutral-text-primary font-bold text-sm">{Math.round(ingredient.calories)}</span>
                    <span className="text-[8px] text-neutral-text-secondary uppercase">kcal</span>
                </div>

                <button
                    onClick={() => onRemove(ingredient.id)}
                    className="ml-2 text-neutral-text-secondary/30 hover:text-red-500 transition-colors md:opacity-0 md:group-hover:opacity-100"
                    aria-label={t('meals.remove_ingredient')}
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
        </li>
    );
};
