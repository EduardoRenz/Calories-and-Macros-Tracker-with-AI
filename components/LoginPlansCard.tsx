import React from 'react';
import Link from 'next/link';

const LoginPlansCard: React.FC = () => {
    return (
        <div className="mt-6 pt-6 border-t border-neutral-border">
            <p className="text-sm text-neutral-text-secondary mb-3">
                Want to see our available plans?
            </p>
            <Link
                href="/plans"
                className="inline-flex items-center gap-2 text-brand-green hover:text-brand-green/80 transition-colors text-sm font-medium"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                View Plans
            </Link>
        </div>
    );
};

export default LoginPlansCard;
