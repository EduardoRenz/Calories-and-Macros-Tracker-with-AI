import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import Modal from './ui/Modal';
import { AlertIcon } from './icons';

interface ModelImageWarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGoToSettings: () => void;
    modelName: string;
}

export const ModelImageWarningModal: React.FC<ModelImageWarningModalProps> = ({
    isOpen,
    onClose,
    onGoToSettings,
    modelName
}) => {
    const { t } = useTranslation();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            showCloseButton
            size="md"
            dataTestId="model-image-warning-modal"
            className="bg-healthpal-panel w-full max-w-md rounded-2xl border border-healthpal-border shadow-2xl"
            bodyClassName="p-6"
        >
            <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                    <AlertIcon className="w-8 h-8 text-yellow-400" />
                </div>

                <h3 className="text-xl font-bold text-white mb-3">
                    {t('model_image_warning.title', { model: modelName })}
                </h3>

                <p className="text-healthpal-text-secondary mb-6 leading-relaxed">
                    {t('model_image_warning.message', { model: modelName })}
                </p>

                <div className="flex gap-3 w-full">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-healthpal-card text-healthpal-text-primary font-bold py-3 px-4 rounded-lg hover:bg-healthpal-border transition-all"
                    >
                        {t('model_image_warning.close')}
                    </button>
                    <button
                        onClick={onGoToSettings}
                        className="flex-1 bg-healthpal-green text-black font-bold py-3 px-4 rounded-lg hover:brightness-110 transition-all"
                    >
                        {t('model_image_warning.go_to_settings')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ModelImageWarningModal;
