import React from 'react';
import { CheckIcon, XMarkIcon } from '../icons';
import { PendingAction, AddIngredientActionData, UpdateIngredientActionData } from '../../domain/entities/ChatMessage';
import { useTranslation } from '../../hooks/useTranslation';

interface PendingActionCardProps {
    action: PendingAction;
    onConfirm: (actionId: string) => void;
    onCancel: (actionId: string) => void;
}

const PendingActionCard: React.FC<PendingActionCardProps> = ({
    action,
    onConfirm,
    onCancel
}) => {
    const { t } = useTranslation();

    const renderActionDetails = () => {
        switch (action.type) {
            case 'add_ingredient': {
                const data = action.data as AddIngredientActionData;
                const ing = data.ingredient;
                if (!ing) return null;

                return (
                    <div className="bg-neutral-panel rounded-lg p-3 my-2 text-sm border border-neutral-border">
                        <div className="grid grid-cols-2 gap-2 text-center my-2">
                            <div>
                                <p id='pending-action-protein' className="text-neutral-text-secondary text-xs">{t('assistant.protein')}</p>
                                <p className="font-bold text-green-400">{ing.protein}g</p>
                            </div>
                            <div>
                                <p id='pending-action-carbs' className="text-neutral-text-secondary text-xs">{t('assistant.carbs')}</p>
                                <p className="font-bold text-yellow-500">{ing.carbs}g</p>
                            </div>
                            <div>
                                <p className="text-neutral-text-secondary text-xs">{t('assistant.fats')}</p>
                                <p className="font-bold text-orange-400">{ing.fats}g</p>
                            </div>
                            <div>
                                <p className="text-neutral-text-secondary text-xs">{t('assistant.fiber')}</p>
                                <p className="font-bold text-blue-400">{ing.fiber || 0}g</p>
                            </div>
                        </div>
                        <div className="text-center border-t border-neutral-border pt-2 mt-2">
                            <p className="text-neutral-text-secondary text-xs">{t('assistant.calories')}</p>
                            <p className="font-bold text-white text-lg">{ing.calories} kcal</p>
                        </div>
                    </div>
                );
            }

            case 'update_ingredient': {
                const data = action.data as UpdateIngredientActionData;
                const ing = data.updates;
                if (!ing) return null;

                return (
                    <div className="bg-neutral-panel rounded-lg p-3 my-2 text-sm border border-neutral-border">
                        <div className="grid grid-cols-2 gap-2 text-center my-2">
                            {ing.protein !== undefined && (
                                <div>
                                    <p className="text-neutral-text-secondary text-xs">{t('assistant.protein')}</p>
                                    <p className="font-bold text-green-400">{ing.protein}g</p>
                                </div>
                            )}
                            {ing.carbs !== undefined && (
                                <div>
                                    <p className="text-neutral-text-secondary text-xs">{t('assistant.carbs')}</p>
                                    <p className="font-bold text-yellow-500">{ing.carbs}g</p>
                                </div>
                            )}
                            {ing.fats !== undefined && (
                                <div>
                                    <p className="text-neutral-text-secondary text-xs">{t('assistant.fats')}</p>
                                    <p className="font-bold text-orange-400">{ing.fats}g</p>
                                </div>
                            )}
                            {ing.fiber !== undefined && (
                                <div>
                                    <p className="text-neutral-text-secondary text-xs">{t('assistant.fiber')}</p>
                                    <p className="font-bold text-blue-400">{ing.fiber}g</p>
                                </div>
                            )}
                        </div>
                        {ing.calories !== undefined && (
                            <div className="text-center border-t border-neutral-border pt-2 mt-2">
                                <p className="text-neutral-text-secondary text-xs">{t('assistant.calories')}</p>
                                <p className="font-bold text-white text-lg">{ing.calories} kcal</p>
                            </div>
                        )}
                        {ing.quantity !== undefined && (
                            <div className="text-center mt-1">
                                <p className="text-neutral-text-secondary text-xs">{t('assistant.new_quantity')}</p>
                                <p className="font-bold text-white">{ing.quantity}</p>
                            </div>
                        )}
                    </div>
                );
            }

            case 'remove_ingredient':
                return (
                    <div className="bg-red-500/10 rounded-lg p-3 my-2 text-sm border border-red-500/30 text-center">
                        <p className="text-red-300">
                            {t('assistant.action_undone_warning')}
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="mt-3 bg-neutral-card rounded-xl p-4 border border-neutral-border shadow-sm">
            <h4 className="font-bold text-sm mb-1 text-neutral-text-primary">
                {t('assistant.confirm_action')}
            </h4>
            <p className="text-sm text-neutral-text-secondary mb-2">
                {action.description}
            </p>

            {renderActionDetails()}

            <div className="flex gap-2 mt-3">
                <button
                    onClick={() => onCancel(action.id)}
                    className="flex-1 py-2 px-3 rounded-lg bg-neutral-card text-white text-sm font-semibold hover:bg-neutral-border transition-colors flex items-center justify-center gap-2"
                >
                    <XMarkIcon className="w-4 h-4" />
                    {t('assistant.cancel')}
                </button>
                <button
                    onClick={() => onConfirm(action.id)}
                    className="flex-1 py-2 px-3 rounded-lg bg-brand-primary text-black text-sm font-semibold hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
                >
                    <CheckIcon className="w-4 h-4" />
                    {t('assistant.confirm')}
                </button>
            </div>
        </div>
    );
};

export default PendingActionCard;
