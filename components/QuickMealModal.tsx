
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useTranslation } from '../hooks/useTranslation';
import type { Ingredient, MealSummary } from '../domain/entities/dashboard';
import { SparklesIcon, EditIcon, TrashIcon, CheckIcon, XMarkIcon } from './icons';
import { ImageRecognitionService } from '../domain/services/ImageRecognitionService';
import { ServiceFactory } from '../data/ServiceFactory';
import { useLanguage } from '../contexts/LanguageContext';
import { RepositoryFactory } from '../data/RepositoryFactory';

interface QuickMealModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const getMealTypeForCurrentTime = (): keyof MealSummary => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch';
    if (hour >= 16 && hour < 22) return 'dinner';
    return 'snacks';
};

const QuickMealModal: React.FC<QuickMealModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [mealType, setMealType] = useState<keyof MealSummary>('breakfast');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analyzedIngredients, setAnalyzedIngredients] = useState<Omit<Ingredient, 'id'>[]>([]);
    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Omit<Ingredient, 'id'> | null>(null);
    const [originalEditForm, setOriginalEditForm] = useState<Omit<Ingredient, 'id'> | null>(null);

    const dashboardRepository = useMemo(() => RepositoryFactory.getDashboardRepository(), []);
    const imageRecognitionService: ImageRecognitionService = useMemo(() => ServiceFactory.getImageRecognitionService(), []);

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            handleReset();
            setMealType(getMealTypeForCurrentTime());
            // Check if mobile device
            setIsMobileDevice(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
            setAnalyzedIngredients([]);
            setError(null);
        }
    };

    const handleReset = () => {
        setImage(null);
        setImagePreview(null);
        setAnalyzedIngredients([]);
        setError(null);
        setIsLoading(false);
        setEditingIndex(null);
        setEditForm(null);
        setOriginalEditForm(null);
    };

    const handleCameraInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
            setAnalyzedIngredients([]);
            setError(null);
        }
    };

    const handleAnalyzeMeal = async () => {
        if (!image) return;

        setIsLoading(true);
        setError(null);

        try {
            const ingredients = await imageRecognitionService.analyzeMealImage(image, language);

            if (ingredients && ingredients.length > 0) {
                setAnalyzedIngredients(ingredients);
            } else {
                setError(t('quick_meal_modal.analysis_error'));
            }
        } catch (err) {
            console.error("Image Analysis Error:", err);
            setError(t('quick_meal_modal.analysis_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToDiary = async () => {
        if (analyzedIngredients.length === 0) return;
        setIsLoading(true);
        try {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const date = `${year}-${month}-${day}`;
            await dashboardRepository.addIngredients(date, mealType, analyzedIngredients);
            onSuccess();
        } catch (err) {
            console.error("Failed to add ingredients:", err);
            setError(t('quick_meal_modal.add_error'));
            setIsLoading(false);
        }
    };

    const handleDeleteIngredient = (index: number) => {
        setAnalyzedIngredients(prev => prev.filter((_, i) => i !== index));
    };

    const handleEditIngredient = (index: number) => {
        setEditingIndex(index);
        setEditForm({ ...analyzedIngredients[index] });
        setOriginalEditForm({ ...analyzedIngredients[index] });
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditForm(null);
        setOriginalEditForm(null);
    };

    const handleSaveEdit = () => {
        if (editingIndex !== null && editForm) {
            setAnalyzedIngredients(prev => {
                const newIngredients = [...prev];
                newIngredients[editingIndex] = editForm;
                return newIngredients;
            });
            setEditingIndex(null);
            setEditForm(null);
            setOriginalEditForm(null);
        }
    };

    const parseGrams = (str: string): number => {
        const match = str.match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[0]) : 0;
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (editForm && originalEditForm) {
            const { name, value } = e.target;

            if (name === 'quantity') {
                const newGrams = parseGrams(value);
                const oldGrams = parseGrams(originalEditForm.quantity);

                const updatedForm = { ...editForm, [name]: value };

                if (oldGrams > 0) {
                    const ratio = newGrams / oldGrams;
                    updatedForm.calories = Math.round(originalEditForm.calories * ratio);
                    updatedForm.protein = Number((originalEditForm.protein * ratio).toFixed(1));
                    updatedForm.carbs = Number((originalEditForm.carbs * ratio).toFixed(1));
                    updatedForm.fats = Number((originalEditForm.fats * ratio).toFixed(1));
                    updatedForm.fiber = Number(((originalEditForm.fiber || 0) * ratio).toFixed(1));
                }
                setEditForm(updatedForm);
            } else {
                setEditForm(prev => prev ? { ...prev, [name]: value } : null);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-healthpal-panel w-full max-w-lg p-8 rounded-2xl border border-healthpal-border shadow-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-white">
                    <SparklesIcon className="w-6 h-6 text-healthpal-green" />
                    {t('quick_meal_modal.title')}
                </h2>

                <div className="mb-6">
                    <label htmlFor="mealTypeSelect" className="block text-sm font-medium text-healthpal-text-secondary mb-2">{t('quick_meal_modal.log_as')}</label>
                    <select
                        id="mealTypeSelect"
                        value={mealType}
                        onChange={(e) => setMealType(e.target.value as keyof MealSummary)}
                        className="w-full bg-healthpal-card border border-healthpal-border rounded-lg p-3 appearance-none focus:ring-healthpal-green focus:border-healthpal-green text-white"
                    >
                        <option value="breakfast">{t('meals.breakfast')}</option>
                        <option value="lunch">{t('meals.lunch')}</option>
                        <option value="dinner">{t('meals.dinner')}</option>
                        <option value="snacks">{t('meals.snacks')}</option>
                    </select>
                </div>


                {imagePreview ? (
                    <div className="mb-4">
                        <Image src={imagePreview} alt="Meal preview" width={400} height={192} className="w-full h-48 object-cover rounded-lg mb-4" />
                        <div className="flex gap-4">
                            <button onClick={handleReset} className="w-full bg-healthpal-card text-healthpal-text-primary font-bold py-3 rounded-lg hover:bg-healthpal-border transition-all">
                                {t('quick_meal_modal.change_image_button')}
                            </button>
                            <button onClick={handleAnalyzeMeal} disabled={isLoading || analyzedIngredients.length > 0} className="w-full bg-healthpal-green text-black font-bold py-3 rounded-lg hover:brightness-110 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isLoading ? t('quick_meal_modal.analyzing_button') : t('navbar.quick_meal')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-48 flex flex-col justify-center items-center border-2 border-dashed border-healthpal-border rounded-lg mb-4 text-center p-4">
                        <p className="mb-2 text-healthpal-text-secondary">{t('quick_meal_modal.upload_prompt')}</p>
                        <div className="flex gap-2 flex-wrap justify-center">
                            {isMobileDevice && (
                                <label className="bg-healthpal-card cursor-pointer text-healthpal-text-primary font-bold py-2 px-4 rounded-lg hover:bg-healthpal-border transition-all">
                                    {t('quick_meal_modal.take_photo_button')}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        className="hidden"
                                        onChange={handleCameraInput}
                                    />
                                </label>
                            )}
                            <label className="bg-healthpal-card cursor-pointer text-healthpal-text-primary font-bold py-2 px-4 rounded-lg hover:bg-healthpal-border transition-all">
                                {t('quick_meal_modal.upload_button')}
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        </div>
                    </div>
                )}

                {error && <p className="text-red-400 text-sm text-center my-2">{error}</p>}

                {analyzedIngredients.length > 0 && (
                    <div className="mt-6">
                        <h3 className="font-bold text-lg mb-2">{t('quick_meal_modal.gemini_results')}</h3>
                        <p className="text-sm text-healthpal-text-secondary mb-4">{t('quick_meal_modal.review_prompt')}</p>
                        <div className="max-h-40 overflow-y-auto bg-healthpal-card p-3 rounded-lg space-y-2">
                            {analyzedIngredients.map((ing, index) => (
                                <div key={index} className="p-2 bg-healthpal-panel rounded">
                                    {editingIndex === index && editForm ? (
                                        <div className="flex flex-col gap-2">
                                            <div className="grid grid-cols-12 gap-2 text-sm">
                                                <div className="col-span-5">
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={editForm.name}
                                                        onChange={handleEditFormChange}
                                                        className="w-full bg-healthpal-card border border-healthpal-border rounded px-2 py-1 text-white text-xs"
                                                        placeholder="Name"
                                                    />
                                                </div>
                                                <div className="col-span-3">
                                                    <input
                                                        type="text"
                                                        name="quantity"
                                                        value={editForm.quantity}
                                                        onChange={handleEditFormChange}
                                                        className="w-full bg-healthpal-card border border-healthpal-border rounded px-2 py-1 text-white text-xs"
                                                        placeholder="Qty"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <input
                                                        type="number"
                                                        name="calories"
                                                        value={editForm.calories}
                                                        readOnly
                                                        className="w-full bg-healthpal-card border border-healthpal-border rounded px-2 py-1 text-gray-400 text-xs cursor-not-allowed"
                                                        placeholder="Kcal"
                                                    />
                                                </div>
                                                <div className="col-span-2 flex justify-end gap-1">
                                                    <button onClick={handleSaveEdit} className="text-green-400 hover:text-green-300">
                                                        <CheckIcon className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={handleCancelEdit} className="text-red-400 hover:text-red-300">
                                                        <XMarkIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-12 gap-2 text-sm items-center">
                                            <span className="col-span-7 font-medium truncate" title={ing.name}>{ing.name} <span className="text-healthpal-text-secondary font-normal">({ing.quantity})</span></span>
                                            <span className="col-span-3 text-right text-healthpal-text-secondary">{Math.round(ing.calories)} kcal</span>
                                            <div className="col-span-2 flex justify-end gap-1">
                                                <button onClick={() => handleEditIngredient(index)} className="text-healthpal-text-secondary hover:text-white transition-colors">
                                                    <EditIcon className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteIngredient(index)} className="text-healthpal-text-secondary hover:text-red-400 transition-colors">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button onClick={handleAddToDiary} disabled={isLoading} className="w-full mt-4 bg-healthpal-green text-black font-bold py-3 rounded-lg hover:brightness-110 transition-all disabled:opacity-50">
                            {t('quick_meal_modal.add_to_diary_button')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuickMealModal;