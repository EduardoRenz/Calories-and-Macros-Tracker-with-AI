import React from 'react';
import { DonationPanel } from './DonationPanel';

export const Footer: React.FC = () => {
    return (
        <footer className="w-full bg-healthpal-panel border-t border-healthpal-border py-8 mt-12">
            <div className="max-w-screen-2xl mx-auto px-6 lg:px-8">
                <DonationPanel variant="wide" />

                <div className="mt-8 pt-6 border-t border-healthpal-border/50 text-center">
                    <p className="text-healthpal-text-secondary text-xs">
                        © {new Date().getFullYear()} CalorieApp. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
