import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useTranslation } from '../hooks/useTranslation';
import type { Ingredient, MealSummary } from '../domain/entities/dashboard';
import { SparklesIcon, EditIcon, TrashIcon } from './icons';
import Modal from './ui/Modal';
import { ImageRecognitionService } from '../domain/services/ImageRecognitionService';
import { ImageCompressionService } from '../domain/services/ImageCompressionService';
import { ServiceFactory } from '../data/ServiceFactory';
import { RepositoryFactory } from '../data/RepositoryFactory';
import { TelemetryFactory } from '../data/TelemetryFactory';
import { useLanguage } from '../contexts/LanguageContext';
import { AiAccessException, AiDisabledException, PremiumOnlyException, ApiKeysRequiredException } from '../domain/exceptions/AiAccessException';
import { EmptyAnalysisResultException, ImageTooLargeException, InvalidApiKeyException, RateLimitedException } from '../domain/exceptions/ImageAnalysisException';
import MarkdownRenderer from './assistant/MarkdownRenderer';

// Upper bound for the (already compressed) image payload sent to AI providers.
const MAX_IMAGE_SIZE_BYTES = 4.5 * 1024 * 1024;



interface QuickMealModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onAddIngredients: (date: string, mealType: keyof MealSummary, ingredients: Omit<Ingredient, 'id'>[]) => Promise<void>;
}

const getMealTypeForCurrentTime = (): keyof MealSummary => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch';
    if (hour >= 16 && hour < 22) return 'dinner';
    return 'snacks';
};

const QuickMealModal: React.FC<QuickMealModalProps> = ({ isOpen, onClose, onSuccess, onAddIngredients }) => {
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
    const [imagePrompt, setImagePrompt] = useState<string>('');

    const [imageRecognitionService, setImageRecognitionService] = useState<ImageRecognitionService | null>(null);
    const imageCompressionService: ImageCompressionService = useMemo(() => ServiceFactory.getImageCompressionService(), []);

    useEffect(() => {
        const initService = async () => {
            const service = await ServiceFactory.getImageRecognitionService();
            setImageRecognitionService(service);
        };
        initService();
    }, []);

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

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            let file = e.target.files[0];

            // Compress and resize
            try {
                file = await imageCompressionService.compress(file, 0.9, 2048, 2048);
            } catch (err) {
                console.error("Compression failed, using original file", err);
                TelemetryFactory.getTelemetryService().captureError(err, {
                    action: 'quick_meal_image_compression',
                    category: 'image_compression',
                });
            }

            // Prevent analysis upfront when the payload is over the provider limit.
            if (file.size > MAX_IMAGE_SIZE_BYTES) {
                setError(t('quick_meal_modal.payload_too_large_error'));
                return;
            }

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
        setImagePrompt('');
    };

    const handleCameraInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            let file = e.target.files[0];

            // Compress and resize
            try {
                file = await imageCompressionService.compress(file, 0.9, 2048, 2048);
            } catch (err) {
                console.error("Compression failed, using original file", err);
                TelemetryFactory.getTelemetryService().captureError(err, {
                    action: 'quick_meal_image_compression',
                    category: 'image_compression',
                });
            }

            // Prevent analysis upfront when the payload is over the provider limit.
            if (file.size > MAX_IMAGE_SIZE_BYTES) {
                setError(t('quick_meal_modal.payload_too_large_error'));
                return;
            }

            setImage(file);
            setImagePreview(URL.createObjectURL(file));
            setAnalyzedIngredients([]);
            setError(null);
        }
    };

    const handleAnalyzeMeal = async () => {
        if (!image || !imageRecognitionService) return;

        if (image.size > MAX_IMAGE_SIZE_BYTES) {
            setError(t('quick_meal_modal.payload_too_large_error'));
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const aiAccessService = ServiceFactory.getAiAccessService();
            await aiAccessService.checkAccess('quick_meal_photo');

            const ingredients = await imageRecognitionService.analyzeMealImage(image, language, imagePrompt);
            setAnalyzedIngredients(ingredients);
        } catch (err) {
            console.error("Image Analysis Error:", err);
            const telemetry = TelemetryFactory.getTelemetryService();
            // Only expected subscription outcomes are access events; everything else
            // (including local failures like an invalid custom key) must reach error
            // tracking so issues that never hit the server are still observable.
            const isAccessOutcome = err instanceof AiAccessException;

            if (isAccessOutcome) {
                // Expected business outcome (premium/disabled/api keys) - measure frequency only
                telemetry.trackEvent({
                    name: 'user_error',
                    params: { error_action: 'quick_meal_analyze', error_category: 'ai_access' },
                });
            } else {
                telemetry.captureError(err, {
                    action: 'quick_meal_analyze',
                    category: 'ai_analysis',
                    extras: { imageSizeBytes: image?.size ?? 0, promptLength: imagePrompt.length },
                });
            }

            if (err instanceof EmptyAnalysisResultException) {
                setError(t('quick_meal_modal.analysis_empty_error'));
            } else if (err instanceof ImageTooLargeException) {
                setError(t('quick_meal_modal.payload_too_large_error'));
            } else if (err instanceof RateLimitedException) {
                setError(t('quick_meal_modal.analysis_transient_error'));
            } else if (err instanceof InvalidApiKeyException) {
                // Only tell users about custom keys when they actually configured one;
                // paying users without keys should never be sent to key management.
                const hasCustomKeys = RepositoryFactory.getUserApiKeysRepository().hasApiKeys();
                setError(hasCustomKeys ? t('quick_meal_modal.custom_key_failed_error') : t('quick_meal_modal.analysis_error'));
            } else if (err instanceof AiDisabledException) {
                setError(t('ai_errors.disabled'));
            } else if (err instanceof PremiumOnlyException) {
                setError(t('ai_errors.premium_required'));
            } else if (err instanceof ApiKeysRequiredException) {
                setError(t('ai_errors.api_keys_required'));
            } else {
                setError(t('quick_meal_modal.analysis_error'));
            }
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
            await onAddIngredients(date, mealType, analyzedIngredients);
            onSuccess();
        } catch (err) {
            console.error("Failed to add ingredients:", err);
            TelemetryFactory.getTelemetryService().captureError(err, {
                action: 'quick_meal_add_to_diary',
                category: 'data',
            });
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

    const parseGrams = (str: string): number => {
        const match = str.match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[0]) : 0;
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (editForm && originalEditForm && editingIndex !== null) {
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
                // Apply changes immediately
                setAnalyzedIngredients(prev => {
                    const newIngredients = [...prev];
                    newIngredients[editingIndex] = updatedForm;
                    return newIngredients;
                });
            } else {
                const updatedForm = { ...editForm, [name]: value };
                setEditForm(updatedForm);
                // Apply changes immediately
                setAnalyzedIngredients(prev => {
                    const newIngredients = [...prev];
                    newIngredients[editingIndex] = updatedForm;
                    return newIngredients;
                });
            }
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            showCloseButton
            closeOnBackdropClick={false}
            dataTestId="quick-meal-modal"
            size="lg"
            className="bg-neutral-panel w-full max-w-lg rounded-2xl border border-neutral-border shadow-2xl"
            bodyClassName="p-8 max-h-[85vh] overflow-y-auto overscroll-contain"
        >
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-on-surface">
                <SparklesIcon className="w-6 h-6 text-brand-green" />
                {t('quick_meal_modal.title')}
            </h2>

            <div className="mb-6">
                <label htmlFor="mealTypeSelect" className="block text-sm font-medium text-neutral-text-secondary mb-2">{t('quick_meal_modal.log_as')}</label>
                <select
                    id="mealTypeSelect"
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as keyof MealSummary)}
                    className="w-full bg-surface-container-lowest border border-neutral-border rounded-lg p-3 appearance-none text-on-surface focus:ring-brand-green focus:border-brand-green"
                    data-testid="meal-type-select"
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

                    <div className="mb-4">
                        <label htmlFor="imagePrompt" className="block text-sm font-medium text-neutral-text-secondary mb-2">
                            {t('quick_meal_modal.prompt_label')} ({t('quick_meal_modal.prompt_optional')})
                        </label>
                        <textarea
                            id="imagePrompt"
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                            placeholder={t('quick_meal_modal.prompt_placeholder')}
                            className="w-full bg-surface-container-lowest border border-neutral-border rounded-lg p-3 text-on-surface placeholder-neutral-text-secondary focus:ring-brand-green focus:border-brand-green resize-none"
                            rows={3}
                            data-testid="image-prompt-textarea"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button onClick={handleReset} className="w-full bg-surface-container-low text-on-surface font-bold py-3 rounded-lg hover:bg-surface-container transition-all">
                            {t('quick_meal_modal.change_image_button')}
                        </button>
                        <button onClick={handleAnalyzeMeal} disabled={isLoading || analyzedIngredients.length > 0} className="w-full bg-secondary text-on-secondary font-bold py-3 rounded-lg hover:brightness-110 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" data-testid="analyze-meal-button">
                            {isLoading ? t('quick_meal_modal.analyzing_button') : t('quick_meal_modal.analyze_image')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="h-48 flex flex-col justify-center items-center border-2 border-dashed border-outline-variant rounded-lg mb-4 text-center p-4 bg-surface-container-low/40">
                    <p className="mb-2 text-neutral-text-secondary">{t('quick_meal_modal.upload_prompt')}</p>
                    <div className="flex gap-2 flex-wrap justify-center">
                        {isMobileDevice && (
                            <label className="bg-surface-container-lowest border border-neutral-border cursor-pointer text-on-surface font-bold py-2 px-4 rounded-lg hover:bg-surface-container-low transition-all">
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
                        <label className="bg-surface-container-lowest border border-neutral-border cursor-pointer text-on-surface font-bold py-2 px-4 rounded-lg hover:bg-surface-container-low transition-all">
                            {t('quick_meal_modal.upload_button')}
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} data-testid="image-upload-input" />
                        </label>
                    </div>
                </div>
            )}

            {error && (
                <div className="my-2 text-error text-center">
                    <MarkdownRenderer content={error} />
                </div>
            )}

            {analyzedIngredients.length > 0 && (
                <div className="mt-6" data-testid="quick-meal-modal-ingredients">
                    <h3 className="font-bold text-lg mb-2 text-on-surface">{t('quick_meal_modal.ai_analysis')}</h3>
                    <p className="text-sm text-neutral-text-secondary mb-4">{t('quick_meal_modal.review_prompt')}</p>
                    <div className="max-h-60 overflow-y-auto bg-surface-container-low p-3 rounded-lg space-y-2 border border-neutral-border">
                        {analyzedIngredients.map((ing, index) => (
                            <div key={index} className="p-3 bg-surface-container-lowest border border-neutral-border rounded-xl">
                                {editingIndex === index && editForm ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="grid grid-cols-12 gap-2 text-sm">
                                            <div className="col-span-6">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={editForm.name}
                                                    onChange={handleEditFormChange}
                                                    className="w-full bg-surface-container-lowest border border-neutral-border rounded px-2 py-1 text-on-surface text-xs"
                                                    placeholder="Name"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <input
                                                    type="text"
                                                    name="quantity"
                                                    value={editForm.quantity}
                                                    onChange={handleEditFormChange}
                                                    className="w-full bg-surface-container-lowest border border-neutral-border rounded px-2 py-1 text-on-surface text-xs"
                                                    placeholder="Qty"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <input
                                                    type="number"
                                                    name="calories"
                                                    value={editForm.calories}
                                                    readOnly
                                                    className="w-full bg-surface-container-low border border-neutral-border rounded px-2 py-1 text-neutral-text-secondary text-xs cursor-not-allowed"
                                                    placeholder="Kcal"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-12 gap-2 text-sm items-center text-on-surface">
                                        <span className="col-span-7 font-medium truncate" title={ing.name}>{ing.name} <span className="text-neutral-text-secondary font-normal">({ing.quantity})</span></span>
                                        <span className="col-span-3 text-right text-neutral-text-secondary">{Math.round(ing.calories)} kcal</span>
                                        <div className="col-span-2 flex justify-end gap-1">
                                            <button onClick={() => handleEditIngredient(index)} className="text-neutral-text-secondary hover:text-on-surface transition-colors">
                                                <EditIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteIngredient(index)} className="text-neutral-text-secondary hover:text-error transition-colors">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAddToDiary} disabled={isLoading} className="w-full mt-4 bg-secondary text-on-secondary font-bold py-3 rounded-lg hover:brightness-110 transition-all disabled:opacity-50" data-testid="add-to-diary-button">
                        {t('quick_meal_modal.add_to_diary_button')}
                    </button>
                </div>
            )}
        </Modal>
    );
};

export default QuickMealModal;
