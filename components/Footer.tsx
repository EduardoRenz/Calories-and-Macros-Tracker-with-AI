import Link from 'next/link';
import { env } from '../env';

export const Footer: React.FC = () => {
    return (
        <footer className="w-full bg-neutral-panel border-t border-neutral-border py-8 mt-12 pb-24 md:pb-8 z-30">
            <div className="w-full px-6 lg:px-8">
                {/* <DonationPanel variant="wide" /> */}

                <div className="mt-8 pt-6 border-t border-neutral-border/50 text-center flex flex-col items-center gap-2">
                    <div className="flex gap-4">
                        <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                            <p className="text-neutral-text-secondary text-xs cursor-pointer hover:underline">
                                Política de Privacidade
                            </p>
                        </Link>
                        <Link href="/terms-of-use" target="_blank" rel="noopener noreferrer">
                            <p className="text-neutral-text-secondary text-xs cursor-pointer hover:underline">
                                Termos de Uso
                            </p>
                        </Link>
                    </div>
                    <p className="text-neutral-text-secondary text-xs">
                        © {new Date().getFullYear()} LeveMente. All rights reserved.
                    </p>
                    <p className="text-neutral-text-secondary/60 text-[10px]">
                        v{env.NEXT_PUBLIC_APP_VERSION}
                    </p>
                </div>
            </div>
        </footer>
    );
};
