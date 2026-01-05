import React from 'react';
import { Plan } from '../../domain/entities/payment';

interface PlanCardProps {
    plan: Plan;
    onSelect: (plan: Plan) => void;
    isLoading?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect, isLoading = false }) => {
    const isPopular = plan.isPopular;
    const isMemberPlan = plan.name.toLowerCase().includes('member') || plan.name.toLowerCase().includes('miembro') || plan.name.toLowerCase().includes('membro');
    const shouldUseGreenStyle = isPopular || isMemberPlan;

    return (
        <div
            className={`relative flex flex-col rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md ${shouldUseGreenStyle
                ? 'border-green-500 bg-gray-900/50'
                : 'border-gray-800 bg-gray-900/20'
                }`}
        >
            {isPopular && plan.discountMessage && (
                <div className="absolute -top-3 right-4 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-black shadow-lg">
                    {plan.discountMessage}
                </div>
            )}

            <div className="mb-4">
                <h3 className={`text-lg font-semibold ${shouldUseGreenStyle ? 'text-green-400' : 'text-gray-200'}`}>
                    {plan.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                        {plan.currency === 'BRL' ? 'R$' : '$'}
                        {plan.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-400">/{plan.interval}</span>
                </div>
                {plan.description && (
                    <p className="mt-2 text-sm text-gray-400">{plan.description}</p>
                )}
            </div>

            <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                        {feature.included ? (
                            <svg
                                className="h-5 w-5 shrink-0 text-green-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg
                                className="h-5 w-5 shrink-0 text-gray-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-300' : 'text-gray-500 line-through'}`}>
                            {feature.text}
                        </span>
                    </li>
                ))}
            </ul>

            <button
                onClick={() => onSelect(plan)}
                disabled={isLoading}
                className={`w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors ${shouldUseGreenStyle
                    ? 'bg-green-500 text-black hover:bg-green-400'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                    } disabled:opacity-50`}
            >
                {shouldUseGreenStyle ? (
                    plan.currency === 'BRL' ? 'Atualizar para Membro' : 'Upgrade to Member'
                ) : (
                    plan.currency === 'BRL' ? 'Começar' : 'Get Started'
                )}
            </button>
        </div>
    );
};
