import React, { useState, useEffect, useRef } from 'react';
import { Meal, Ingredient } from '@/domain/entities/dashboard';
import { TrashIcon } from '../icons';
import { useTranslation } from '@/hooks/useTranslation';
import { LegumesIcon, MeatsIcon, FruitsIcon, CerealsIcon, PastaIcon, OthersIcon } from '../FoodIcons';

interface IngredientItemProps {
    ingredient: Meal['ingredients'][0];
    onRemove: (id: string) => void;
    onUpdate: (ingredientId: string, updates: Partial<Ingredient>) => void;
}

const CategoryIcon = ({ category, className }: { category?: string; className?: string }) => {
    switch (category) {
        case 'legumes': return <LegumesIcon className={className} />;
        case 'meats': return <MeatsIcon className={className} />;
        case 'fruits': return <FruitsIcon className={className} />;
        case 'cereals': return <CerealsIcon className={className} />;
        case 'pasta': return <PastaIcon className={className} />;
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
            quantity: newQuantityStr.includes('g') ? `${newQuantity}g` : `${newQuantity}g`, // Normalize to 'g' if requested logic follows AddIngredientModal
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
        <li className="group bg-neutral-panel/50 p-2 rounded-md flex flex-col gap-2 md:grid md:grid-cols-12 md:gap-4 md:items-center">
            <div className="flex items-start justify-between gap-2 md:col-span-4">
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex bg-neutral-panel p-2 rounded-xl text-neutral-text-secondary/50">
                        <CategoryIcon category={ingredient.category} className="w-6 h-6" />
                    </div>
                    <div className="text-neutral-text-primary font-medium leading-snug break-words" title={ingredient.name}>
                        {ingredient.name}
                    </div>
                </div>
                <div className="md:hidden flex justify-end">
                    <button
                        onClick={() => onRemove(ingredient.id)}
                        className="text-red-400 hover:text-red-500"
                        aria-label={t('meals.remove_ingredient')}
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-text-secondary md:contents">
                <div className="whitespace-nowrap md:col-span-2 md:text-center">
                    <span className="md:hidden">Qtd: </span>
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={handleKeyDown}
                            className="bg-neutral-card border border-brand-green rounded px-1 py-0.5 w-16 text-center text-neutral-text-primary focus:outline-none"
                        />
                    ) : (
                        <span
                            onClick={handleStartEditing}
                            className="md:text-neutral-text-secondary cursor-pointer hover:text-brand-green hover:underline decoration-dotted"
                            title={t('meals.edit_quantity')}
                        >
                            {ingredient.quantity}
                        </span>
                    )}
                </div>

                <div className="whitespace-nowrap md:col-span-1 md:text-center text-neutral-text-primary">
                    <span className="md:hidden text-brand-carbs">C: </span>
                    {ingredient.carbs}g
                </div>
                <div className="whitespace-nowrap md:col-span-1 md:text-center text-neutral-text-primary">
                    <span className="md:hidden text-brand-protein">P: </span>
                    {ingredient.protein}g
                </div>
                <div className="whitespace-nowrap md:col-span-1 md:text-center text-neutral-text-primary">
                    <span className="md:hidden text-brand-fats">G: </span>
                    {ingredient.fats}g
                </div>
                <div className="whitespace-nowrap md:col-span-1 md:text-center text-brand-fiber">
                    <span className="md:hidden">F: </span>
                    {ingredient.fiber}g
                </div>
                <div className="whitespace-nowrap md:col-span-1 md:text-center text-neutral-text-primary font-bold">
                    <span className="md:hidden text-brand-green">Kcal: </span>
                    {Math.round(ingredient.calories)}
                </div>
            </div>

            <div className="hidden md:col-span-1 md:flex md:justify-end">
                <button onClick={() => onRemove(ingredient.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500">
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
        </li>
    );
};
