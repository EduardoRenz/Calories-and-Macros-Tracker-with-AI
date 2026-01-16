import React, { useState, useEffect, useRef } from 'react';
import { Meal, Ingredient } from '@/domain/entities/dashboard';
import { TrashIcon } from '../icons';
import { useTranslation } from '@/hooks/useTranslation';

interface IngredientItemProps {
    ingredient: Meal['ingredients'][0];
    onRemove: (id: string) => void;
    onUpdate: (ingredientId: string, updates: Partial<Ingredient>) => void;
}

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
        <li className="group bg-healthpal-panel/50 p-2 rounded-md flex flex-col gap-2 md:grid md:grid-cols-12 md:gap-4 md:items-center">
            <div className="flex items-start justify-between gap-2 md:col-span-4">
                <div className="text-healthpal-text-primary font-medium leading-snug break-words" title={ingredient.name}>
                    {ingredient.name}
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

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-healthpal-text-secondary md:contents">
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
                            className="bg-healthpal-card border border-healthpal-green rounded px-1 py-0.5 w-16 text-center text-healthpal-text-primary focus:outline-none"
                        />
                    ) : (
                        <span
                            onClick={handleStartEditing}
                            className="md:text-healthpal-text-secondary cursor-pointer hover:text-healthpal-green hover:underline decoration-dotted"
                            title={t('meals.edit_quantity')}
                        >
                            {ingredient.quantity}
                        </span>
                    )}
                </div>

                <div className="whitespace-nowrap md:col-span-1 md:text-center text-healthpal-text-primary">
                    <span className="md:hidden text-healthpal-carbs">C: </span>
                    {ingredient.carbs}g
                </div>
                <div className="whitespace-nowrap md:col-span-1 md:text-center text-healthpal-text-primary">
                    <span className="md:hidden text-healthpal-protein">P: </span>
                    {ingredient.protein}g
                </div>
                <div className="whitespace-nowrap md:col-span-1 md:text-center text-healthpal-text-primary">
                    <span className="md:hidden text-healthpal-fats">G: </span>
                    {ingredient.fats}g
                </div>
                <div className="whitespace-nowrap md:col-span-1 md:text-center text-healthpal-fiber">
                    <span className="md:hidden">F: </span>
                    {ingredient.fiber}g
                </div>
                <div className="whitespace-nowrap md:col-span-1 md:text-center text-healthpal-text-primary">
                    <span className="md:hidden text-healthpal-green">Kcal: </span>
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
