import React, { useState } from 'react';
import { CoffeeIcon, CopyIcon, QrCodeIcon, CheckIcon } from './icons';

interface DonationPanelProps {
    variant?: 'compact' | 'wide';
}

export const DonationPanel: React.FC<DonationPanelProps> = ({ variant = 'compact' }) => {
    const pixKey = process.env.PIX_KEY;
    const btcAddress = process.env.BTC_ADDRESS;
    const usdcAddress = process.env.USDC_ADDRESS;

    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(id);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    if (!pixKey && !btcAddress && !usdcAddress) {
        return null;
    }

    const DonationRow = ({
        label,
        value,
        icon: Icon,
        symbol,
        network,
        id,
        bgColor,
        textColor,
        isPix = false
    }: {
        label: string,
        value: string,
        icon?: React.FC<React.SVGProps<SVGSVGElement>>,
        symbol?: string,
        network?: string,
        id: string,
        bgColor?: string,
        textColor?: string,
        isPix?: boolean
    }) => {
        const isCopied = copiedKey === id;

        if (variant === 'wide') {
            return (
                <div className="bg-healthpal-card p-3 rounded-lg border border-healthpal-border flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            {Icon && <Icon className={`w-5 h-5 ${textColor || 'text-healthpal-green'}`} />}
                            {!Icon && symbol && (
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${bgColor || 'bg-healthpal-green'} text-black`}>
                                    {symbol}
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold text-healthpal-text-primary text-sm">{label}</h3>
                                {network && <span className="text-[10px] text-healthpal-text-secondary uppercase">{network}</span>}
                            </div>
                        </div>
                        {isPix && (
                            <div className="bg-white p-0.5 rounded">
                                <QrCodeIcon className="w-5 h-5 text-black" />
                            </div>
                        )}
                    </div>

                    <div className="bg-healthpal-dark/50 p-2 rounded-lg border border-healthpal-border flex items-center justify-between gap-2">
                        <span className="text-healthpal-text-secondary text-xs truncate font-mono">{value}</span>
                        <button
                            onClick={() => handleCopy(value, id)}
                            className="text-healthpal-text-secondary hover:text-healthpal-green transition-colors flex-shrink-0"
                        >
                            {isCopied ? <CheckIcon className="w-4 h-4 text-healthpal-green" /> : <CopyIcon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-healthpal-card p-4 rounded-xl border border-healthpal-border">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        {Icon && <Icon className={`w-5 h-5 ${textColor || 'text-healthpal-green'}`} />}
                        {!Icon && symbol && (
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${bgColor || 'bg-healthpal-green'} text-black`}>
                                {symbol}
                            </div>
                        )}
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${textColor || 'text-healthpal-green'}`}>{label}</span>
                    </div>
                    {network && <span className="bg-healthpal-dark px-2 py-0.5 rounded text-[10px] text-healthpal-text-secondary font-mono">{network}</span>}
                </div>

                <div className="flex items-center gap-3">
                    {isPix && (
                        <div className="bg-white p-1 rounded-md flex-shrink-0">
                            <QrCodeIcon className="w-10 h-10 text-black" />
                        </div>
                    )}
                    <div className="flex-1 bg-healthpal-dark/50 p-2.5 rounded-lg border border-healthpal-border flex items-center justify-between gap-2 overflow-hidden">
                        <span className="text-healthpal-text-primary text-xs truncate font-mono">{value}</span>
                        <button
                            onClick={() => handleCopy(value, id)}
                            className="text-healthpal-text-secondary hover:text-healthpal-green transition-colors flex-shrink-0"
                        >
                            {isCopied ? <CheckIcon className="w-4 h-4 text-healthpal-green" /> : <CopyIcon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`w-full flex flex-col ${variant === 'compact' ? 'max-w-sm mx-auto gap-4' : 'gap-3'}`}>
            <div className={`flex items-center gap-2 ${variant === 'compact' ? 'mb-2' : 'mb-1'}`}>
                <div className={`bg-healthpal-card rounded-lg border border-healthpal-border text-healthpal-green ${variant === 'compact' ? 'p-2' : 'p-1.5'}`}>
                    <CoffeeIcon className={variant === 'compact' ? 'w-6 h-6' : 'w-5 h-5'} />
                </div>
                <div>
                    <h2 className={`font-bold text-healthpal-text-primary uppercase tracking-wide ${variant === 'compact' ? 'text-sm' : 'text-xs'}`}>Donate me a coffee</h2>
                    <p className={`text-healthpal-text-secondary ${variant === 'compact' ? 'text-xs' : 'text-[10px]'}`}>Support the development</p>
                </div>
            </div>

            <div className={`flex flex-col gap-3 ${variant === 'wide' ? 'md:grid md:grid-cols-3 md:gap-3' : ''}`}>
                {pixKey && (
                    <DonationRow
                        label="Pix Key (CPF)"
                        value={pixKey}
                        id="pix"
                        isPix={true}
                    />
                )}
                {btcAddress && (
                    <DonationRow
                        label="Bitcoin"
                        value={btcAddress}
                        symbol="BTC"
                        network="BTC"
                        id="btc"
                        bgColor="bg-[#F7931A]"
                        textColor="text-[#F7931A]"
                    />
                )}
                {usdcAddress && (
                    <DonationRow
                        label="USDC"
                        value={usdcAddress}
                        symbol="$"
                        network="ERC-20"
                        id="usdc"
                        bgColor="bg-[#2775CA]"
                        textColor="text-[#2775CA]"
                    />
                )}
            </div>
        </div>
    );
};
