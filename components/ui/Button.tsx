import React from 'react';
import { SpinnerIcon } from '../icons';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className = '',
            variant = 'secondary',
            size = 'md',
            isLoading = false,
            leftIcon,
            rightIcon,
            fullWidth = false,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles = 'inline-flex items-center justify-center font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed';
        
        const variants = {
            primary: 'bg-primary text-on-primary hover:brightness-110 active:scale-95 shadow-ambient',
            secondary: 'bg-secondary text-on-secondary hover:brightness-110 active:scale-95 shadow-ambient',
            outline: 'border-2 border-neutral-border text-neutral-text-primary hover:bg-neutral-card',
            ghost: 'text-neutral-text-secondary hover:text-neutral-text-primary hover:bg-neutral-card',
        };

        const sizes = {
            sm: 'py-2 px-4 text-sm rounded-lg',
            md: 'py-3 px-6 text-base rounded-xl',
            lg: 'py-4 px-8 text-lg rounded-2xl',
        };

        const widthStyle = fullWidth ? 'w-full' : '';

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
                {...props}
            >
                {isLoading && <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" />}
                {!isLoading && leftIcon && <span className="mr-2 flex items-center">{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span className="ml-2 flex items-center">{rightIcon}</span>}
            </button>
        );
    }
);

Button.displayName = 'Button';
