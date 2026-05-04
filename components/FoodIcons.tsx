import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

// Meal Type Icons
export const BreakfastIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M7 6C7 4.89543 7.89543 4 9 4H15C16.1046 4 17 4.89543 17 6V16C17 17.1046 16.1046 18 15 18H9C7.89543 18 7 17.1046 7 16V6Z" />
        <path d="M7 8H17" />
        <path d="M12 11L10 13L12 15L14 13L12 11Z" />
    </svg>
);

export const LunchIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M6 11C6 8.23858 8.23858 6 11 6H13C15.7614 6 18 8.23858 18 11V12H6V11Z" />
        <path d="M6 14H18" />
        <path d="M6 17H18V18C18 19.1046 17.1046 20 16 20H8C6.89543 20 6 19.1046 6 18V17Z" />
    </svg>
);

export const DinnerIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M11 7v6a2 2 0 0 1-2 2H8" />
        <path d="M11 7h1" />
        <path d="M13 7v10" />
        <path d="M13 11h2" />
    </svg>
);

export const SnacksIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 4C12 4 15 4 18 7C21 10 21 14 18 17C15 20 12 20 12 20C12 20 9 20 6 17C3 14 3 10 6 7C9 4 12 4 12 4Z" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

// Food Category Icons (Desktop simple and transparent gray)
export const LegumesIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M7 12C7 12 9 4 12 4C15 4 17 12 17 12C17 12 15 20 12 20C9 20 7 12 7 12Z" />
        <circle cx="12" cy="8" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="16" r="1" />
    </svg>
);

export const MeatsIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M15 5C15 5 18 5 20 7C22 9 22 12 20 14C18 16 15 16 15 16L12 19L5 12L8 9L15 5Z" />
        <path d="M11 13C11 13 13 11 15 11" />
    </svg>
);

export const FruitsIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="14" r="7" />
        <path d="M12 7V3" />
        <path d="M12 7C12 7 14 4 16 4" />
    </svg>
);

export const CerealsIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M5 20L10 4L14 20" />
        <path d="M10 20L14 4L19 20" />
        <path d="M7 14H17" />
    </svg>
);

export const PastaIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20 10H4" />
        <path d="M5 10C5 15 8 19 12 19C16 19 19 15 19 10" />
        <path d="M8 10V4" />
        <path d="M12 10V3" />
        <path d="M16 10V4" />
    </svg>
);

export const OthersIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8V16" />
        <path d="M8 12H16" />
    </svg>
);
