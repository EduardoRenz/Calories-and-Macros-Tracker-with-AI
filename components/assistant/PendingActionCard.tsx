import React from 'react';
import { CheckIcon, XMarkIcon } from '../icons';
import { PendingAction, AddIngredientActionData } from '../../domain/entities/ChatMessage';
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
            case 'add_ingredient':
            case 'update_ingredient': {
                const data = action.data as AddIngredientActionData;
                const ing = data.ingredient || data.updates;
                if (!ing) return null;

                return (
                    <div className="bg-healthpal-panel rounded-lg p-3 my-2 text-sm border border-healthpal-border">
                        <div className="grid grid-cols-2 gap-2 text-center my-2">
                            <div>
                                <p id='pending-action-protein' className="text-healthpal-text-secondary text-xs">Protein</p>
                                <p className="font-bold text-green-400">{ing.protein}g</p>
                            </div>
                            <div>
                                <p id='pending-action-carbs' className="text-healthpal-text-secondary text-xs">Carbs</p>
                                <p className="font-bold text-yellow-500">{ing.carbs}g</p>
                            </div>
                            <div>
                                <p className="text-healthpal-text-secondary text-xs">Fats</p>
                                <p className="font-bold text-orange-400">{ing.fats}g</p>
                            </div>
                            <div>
                                <p className="text-healthpal-text-secondary text-xs">Fiber</p>
                                <p className="font-bold text-blue-400">{ing.fiber || 0}g</p>
                            </div>
                        </div>
                        <div className="text-center border-t border-healthpal-border pt-2 mt-2">
                            <p className="text-healthpal-text-secondary text-xs">Total Calories</p>
                            <p className="font-bold text-white text-lg">{ing.calories} kcal</p>
                        </div>
                    </div>
                );
            }

            case 'remove_ingredient':
                return (
                    <div className="bg-red-500/10 rounded-lg p-3 my-2 text-sm border border-red-500/30 text-center">
                        <p className="text-red-300">
                            This action cannot be easily undone.
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="mt-3 bg-healthpal-card rounded-xl p-4 border border-healthpal-border shadow-sm">
            <h4 className="font-bold text-sm mb-1 text-healthpal-text-primary">
                {t('assistant.confirm_action')}
            </h4>
            <p className="text-sm text-healthpal-text-secondary mb-2">
                {action.description}
            </p>

            {renderActionDetails()}

            <div className="flex gap-2 mt-3">
                <button
                    onClick={() => onCancel(action.id)}
                    className="flex-1 py-2 px-3 rounded-lg bg-healthpal-card text-white text-sm font-semibold hover:bg-healthpal-border transition-colors flex items-center justify-center gap-2"
                >
                    <XMarkIcon className="w-4 h-4" />
                    {t('assistant.cancel')}
                </button>
                <button
                    onClick={() => onConfirm(action.id)}
                    className="flex-1 py-2 px-3 rounded-lg bg-healthpal-primary text-black text-sm font-semibold hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
                >
                    <CheckIcon className="w-4 h-4" />
                    {t('assistant.confirm')}
                </button>
            </div>
        </div>
    );
};

export default PendingActionCard;
