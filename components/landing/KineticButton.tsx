'use client';

import React from 'react';
import Link from 'next/link';

type KineticButtonSize = 'sm' | 'md' | 'lg';

interface BaseProps {
  size?: KineticButtonSize;
  className?: string;
  children: React.ReactNode;
}

interface LinkProps extends BaseProps {
  href: string;
  onClick?: never;
  type?: never;
  disabled?: never;
}

interface ButtonProps extends BaseProps {
  href?: never;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

type KineticButtonProps = LinkProps | ButtonProps;

const BASE_CLASSES =
  'kinetic-gradient kinetic-gradient-hover font-label rounded-full transition-all inline-flex items-center justify-center text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none';

const SIZE_CLASSES: Record<KineticButtonSize, string> = {
  sm: 'px-6 py-2 text-sm font-semibold shadow-sm hover:scale-105',
  md: 'px-8 py-4 text-base font-semibold hover:shadow-lg hover:-translate-y-1',
  lg: 'px-10 py-4 text-base font-bold hover:shadow-lg hover:-translate-y-0.5',
};

export const KineticButton: React.FC<KineticButtonProps> = (props) => {
  const { size = 'md', className = '', children } = props;
  const finalClassName = `${BASE_CLASSES} ${SIZE_CLASSES[size]} ${className}`.trim();

  if ('href' in props && props.href) {
    return (
      <Link href={props.href} className={finalClassName}>
        {children}
      </Link>
    );
  }

  const { onClick, type = 'button', disabled } = props as ButtonProps;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={finalClassName}
    >
      {children}
    </button>
  );
};
