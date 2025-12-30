import { DonationPanel } from './DonationPanel';
import Link from 'next/link';

export const Footer: React.FC = () => {
    return (
        <footer className="w-full bg-healthpal-panel border-t border-healthpal-border py-8 mt-12">
            <div className="max-w-screen-2xl mx-auto px-6 lg:px-8">
                <DonationPanel variant="wide" />

                <div className="mt-8 pt-6 border-t border-healthpal-border/50 text-center flex flex-col items-center gap-2">
                    <div className="flex gap-4">
                        <Link href="/privacy-policy" target="_blank">
                            <p className="text-healthpal-text-secondary text-xs cursor-pointer hover:underline">
                                Política de Privacidade
                            </p>
                        </Link>
                        <Link href="/terms-of-use" target="_blank">
                            <p className="text-healthpal-text-secondary text-xs cursor-pointer hover:underline">
                                Termos de Uso
                            </p>
                        </Link>
                    </div>
                    <p className="text-healthpal-text-secondary text-xs">
                        © {new Date().getFullYear()} CalorieApp. All rights reserved.
                    </p>
                    <p className="text-healthpal-text-secondary/60 text-[10px]">
                        v{process.env.NEXT_PUBLIC_APP_VERSION}
                    </p>
                </div>
            </div>
        </footer>
    );
};
