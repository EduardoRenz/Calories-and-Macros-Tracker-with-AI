import React from 'react';
import Link from 'next/link';

const LoginPlansCard: React.FC = () => {
    return (
        <div className="mt-6 pt-6 border-t border-healthpal-border">
            <p className="text-sm text-healthpal-text-secondary mb-3">
                Want to see our available plans?
            </p>
            <a
                href="/plans"
                className="inline-flex items-center gap-2 text-healthpal-green hover:text-healthpal-green/80 transition-colors text-sm font-medium"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                View Plans
            </a>
        </div>
    );
};

export default LoginPlansCard;
