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
                if (!ing || !ing.name) return null;

                return (
                    <div className="bg-neutral-panel rounded-lg p-3 my-2 text-sm border border-neutral-border">
                        <div className="grid grid-cols-2 gap-2 text-center my-2">
                            <div>
                                <p id='pending-action-protein' className="text-neutral-text-secondary text-xs">{t('assistant.protein')}</p>
                                <p className="font-bold text-brand-protein">{ing.protein}g</p>
                            </div>
                            <div>
                                <p id='pending-action-carbs' className="text-neutral-text-secondary text-xs">{t('assistant.carbs')}</p>
                                <p className="font-bold text-brand-carbs">{ing.carbs}g</p>
                            </div>
                            <div>
                                <p className="text-neutral-text-secondary text-xs">{t('assistant.fats')}</p>
                                <p className="font-bold text-brand-fats">{ing.fats}g</p>
                            </div>
                            <div>
                                <p className="text-neutral-text-secondary text-xs">{t('assistant.fiber')}</p>
                                <p className="font-bold text-brand-fiber">{ing.fiber || 0}g</p>
                            </div>
                        </div>
                        <div className="text-center border-t border-neutral-border pt-2 mt-2">
                            <p className="text-neutral-text-secondary text-xs">{t('assistant.calories')}</p>
                            <p className="font-bold text-neutral-text-primary text-lg">{ing.calories} kcal</p>
                        </div>
                    </div>
                );
            }

            case 'update_ingredient': {
                const data = action.data as UpdateIngredientActionData;
                const updates = data.updates;
                if (!updates || Object.keys(updates).length === 0) return null;

                return (
                    <div className="bg-neutral-panel rounded-lg p-3 my-2 text-sm border border-neutral-border">
                        <div className="grid grid-cols-2 gap-2 text-center my-2">
                            {updates.protein !== undefined && (
                                <div>
                                    <p className="text-neutral-text-secondary text-xs">{t('assistant.protein')}</p>
                                    <p className="font-bold text-brand-protein">{updates.protein}g</p>
                                </div>
                            )}
                            {updates.carbs !== undefined && (
                                <div>
                                    <p className="text-neutral-text-secondary text-xs">{t('assistant.carbs')}</p>
                                    <p className="font-bold text-brand-carbs">{updates.carbs}g</p>
                                </div>
                            )}
                            {updates.fats !== undefined && (
                                <div>
                                    <p className="text-neutral-text-secondary text-xs">{t('assistant.fats')}</p>
                                    <p className="font-bold text-brand-fats">{updates.fats}g</p>
                                </div>
                            )}
                            {updates.fiber !== undefined && (
                                <div>
                                    <p className="text-neutral-text-secondary text-xs">{t('assistant.fiber')}</p>
                                    <p className="font-bold text-brand-fiber">{updates.fiber}g</p>
                                </div>
                            )}
                        </div>
                        {updates.calories !== undefined && (
                            <div className="text-center border-t border-neutral-border pt-2 mt-2">
                                <p className="text-neutral-text-secondary text-xs">{t('assistant.calories')}</p>
                                <p className="font-bold text-neutral-text-primary text-lg">{updates.calories} kcal</p>
                            </div>
                        )}
                        {updates.quantity !== undefined && (
                            <div className="text-center mt-1">
                                <p className="text-neutral-text-secondary text-xs">{t('assistant.new_quantity')}</p>
                                <p className="font-bold text-neutral-text-primary">{updates.quantity}</p>
                            </div>
                        )}
                        {updates.name && (
                            <div className="text-center mt-1">
                                <p className="text-neutral-text-secondary text-xs">{t('assistant.name')}</p>
                                <p className="font-bold text-neutral-text-primary">{updates.name}</p>
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
                    className="flex-1 py-2 px-3 rounded-lg border border-neutral-border text-neutral-text-primary text-sm font-semibold hover:bg-neutral-panel transition-colors flex items-center justify-center gap-2"
                >
                    <XMarkIcon className="w-4 h-4" />
                    {t('assistant.cancel')}
                </button>
                <button
                    onClick={() => onConfirm(action.id)}
                    className="flex-1 py-2 px-3 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:brightness-110 transition-colors flex items-center justify-center gap-2"
                >
                    <CheckIcon className="w-4 h-4" />
                    {t('assistant.confirm')}
                </button>
            </div>
        </div>
    );
};

export default PendingActionCard;
