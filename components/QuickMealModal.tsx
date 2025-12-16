
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import type { Ingredient, MealSummary } from '../domain/entities/dashboard';
import { SparklesIcon } from './icons';
import { ImageRecognitionService } from '../domain/services/ImageRecognitionService';
import { GeminiImageRecognitionService } from '../data/services/GeminiImageRecognitionService';
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
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const videoRef = React.useRef<HTMLVideoElement>(null);

    const dashboardRepository = useMemo(() => RepositoryFactory.getDashboardRepository(), []);
    const imageRecognitionService: ImageRecognitionService = useMemo(() => new GeminiImageRecognitionService(), []);

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            handleReset();
            setMealType(getMealTypeForCurrentTime());
            // Check if mobile device
            setIsMobileDevice(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        }
    }, [isOpen]);

    useEffect(() => {
        // Cleanup camera stream when component unmounts or camera is deactivated
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

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
        stopCamera();
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Use back camera on mobile
            });
            setStream(mediaStream);
            setIsCameraActive(true);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera access error:", err);
            setError(t('quick_meal_modal.camera_error'));
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraActive(false);
    };

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
                        setImage(file);
                        setImagePreview(URL.createObjectURL(file));
                        setAnalyzedIngredients([]);
                        setError(null);
                        stopCamera();
                    }
                }, 'image/jpeg');
            }
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
            const date = new Date().toISOString().split('T')[0];
            await dashboardRepository.addIngredients(date, mealType, analyzedIngredients);
            onSuccess();
        } catch (err) {
            console.error("Failed to add ingredients:", err);
            setError(t('quick_meal_modal.add_error'));
            setIsLoading(false);
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


                {isCameraActive ? (
                    <div className="mb-4">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-48 object-cover rounded-lg mb-4 bg-black"
                        />
                        <div className="flex gap-4">
                            <button onClick={stopCamera} className="w-full bg-healthpal-card text-healthpal-text-primary font-bold py-3 rounded-lg hover:bg-healthpal-border transition-all">
                                {t('quick_meal_modal.cancel_camera')}
                            </button>
                            <button onClick={capturePhoto} className="w-full bg-healthpal-green text-black font-bold py-3 rounded-lg hover:brightness-110 transition-all">
                                {t('quick_meal_modal.capture_photo')}
                            </button>
                        </div>
                    </div>
                ) : imagePreview ? (
                    <div className="mb-4">
                        <img src={imagePreview} alt="Meal preview" className="w-full h-48 object-cover rounded-lg mb-4" />
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
                                <button onClick={startCamera} className="bg-healthpal-card cursor-pointer text-healthpal-text-primary font-bold py-2 px-4 rounded-lg hover:bg-healthpal-border transition-all">
                                    {t('quick_meal_modal.take_photo_button')}
                                </button>
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
                                <div key={index} className="grid grid-cols-3 gap-2 text-sm p-2 bg-healthpal-panel rounded">
                                    <span className="col-span-2 font-medium">{ing.name} ({ing.quantity})</span>
                                    <span className="col-span-1 text-right text-healthpal-text-secondary">{Math.round(ing.calories)} kcal</span>
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