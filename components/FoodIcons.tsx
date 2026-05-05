import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

// Meal Type Icons
export const BreakfastIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="none" {...props}><path fill="#000000" d="M6 21q-.825 0-1.413-.588T4 19v-8.55q-.925-.55-1.463-1.462T2 7q0-1.65 1.175-2.825T6 3h12q1.65 0 2.825 1.175T22 7q0 1.075-.537 1.988T20 10.45V19q0 .825-.588 1.413T18 21H6Zm0-2h12V9.3l1-.6q.45-.275.725-.725T20 7q0-.825-.588-1.412T18 5H6q-.825 0-1.413.588T4 7q0 .55.263 1.012T5 8.75l1 .55V19Zm5.3-2.3q.3.275.713.275t.687-.275l3-3q.3-.3.3-.713t-.3-.687l-3-3q-.275-.3-.687-.3t-.713.3l-3 3q-.275.275-.275.688t.275.712l3 3Zm.7-2.1L10.4 13l1.6-1.6l1.6 1.6l-1.6 1.6Zm0-2.6Z" /></svg>
);

export const LunchIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="none" {...props}><path fill="#000000" d="M4.615 20q-.67 0-1.143-.472Q3 19.056 3 18.385v-2.77h18v2.77q0 .67-.472 1.143q-.472.472-1.143.472H4.615ZM4 16.615v1.77q0 .269.173.442t.442.173h14.77q.269 0 .442-.173t.173-.442v-1.77H4Zm8-4q-.88 0-1.358.5q-.477.5-1.646.5q-1.17 0-1.64-.5q-.471-.5-1.352-.5q-.88 0-1.358.5q-.477.5-1.646.5v-1q.88 0 1.358-.5q.477-.5 1.646-.5q1.17 0 1.64.5q.471.5 1.352.5q.88 0 1.358-.5q.477-.5 1.646-.5q1.17 0 1.646.5q.477.5 1.358.5q.88 0 1.333-.5q.451-.5 1.62-.5q1.17 0 1.678.5t1.365.5v1q-1.17 0-1.615-.5q-.447-.5-1.327-.5q-.881 0-1.383.5t-1.671.5q-1.17 0-1.646-.5q-.477-.5-1.358-.5Zm-9-3V9q0-2.356 2.087-3.678Q7.176 4 12 4t6.913 1.322Q21 6.644 21 9v.615H3ZM12 5q-3.908 0-5.87.958q-1.963.957-2.095 2.657h15.93q-.132-1.7-2.095-2.657Q15.908 5 12 5Zm0 11.615Zm0-8Z" /></svg>
);

export const DinnerIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="none" {...props}><path fill="#000000" d="M8.242 13.423q-2.192 0-3.717-1.531T3 8.173q0-2 1.333-3.48T7.652 3h.112q-.32.529-.495 1.122t-.175 1.224q0 1.963 1.38 3.338t3.351 1.374q.367 0 .717-.061q.35-.06.67-.181q-.523 1.622-1.881 2.615t-3.089.992m-.006-1q.908 0 1.717-.374t1.405-1.051q-2.233-.16-3.743-1.772t-1.52-3.857q0-.211.028-.413q.029-.202.067-.414q-1.015.556-1.612 1.527t-.597 2.123q0 1.766 1.242 2.999q1.242 1.232 3.013 1.232m9.014-.961h2.789V7.73H17.25zm1.404 3.788q.588 0 .986-.4q.398-.402.398-.994v-1.394H17.25v1.404q0 .588.404.986q.403.398 1 .398M6.158 20h4.088q.485 0 .865-.296q.381-.296.495-.762l.44-1.711H4.358l.44 1.711q.114.466.494.762q.381.296.866.296M2 21v-1h2.25q-.16-.171-.268-.378t-.153-.436l-.752-2.955h10.25l-.752 2.956q-.044.229-.153.435q-.108.207-.268.378h6v-3.81q-.823-.17-1.364-.83q-.54-.66-.54-1.494V6.73h4.789v7.135q0 .834-.531 1.494t-1.354.83V20H22v1zm16.654-8.538" /></svg>
);

export const SnacksIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="none" {...props} ><path d="M18.38 6.24C17.79 3.24 15.14 1 12 1S6.21 3.24 5.62 6.24A4.014 4.014 0 0 0 3 10c0 2.21 1.79 4 4 4c.12 0 .23-.02.34-.02L12.07 23l4.61-9.03c.11.01.21.03.32.03c2.21 0 4-1.79 4-4c0-1.71-1.08-3.19-2.62-3.76zm-6.33 12.39l-2.73-5.21a6.468 6.468 0 0 0 5.4-.02l-2.67 5.23zM17 12c-.52 0-1.01-.2-1.39-.56l-.56-.54l-.66.42a4.52 4.52 0 0 1-4.78-.01l-.66-.41l-.56.54c-.38.35-.87.56-1.39.56a1.999 1.999 0 0 1-.32-3.97l.77-.13l.06-.78C7.71 4.8 9.66 3 12 3s4.29 1.8 4.48 4.12l.06.78l.77.12c.97.16 1.69.99 1.69 1.98c0 1.1-.9 2-2 2z" /></svg>
);

// Food Category Icons (Desktop simple and transparent gray)
export const VegetablesIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 20C12 20 7 14 7 10C7 7 9 5 12 5C15 5 17 7 17 10C17 14 12 20 12 20Z" />
        <path d="M12 5V3" />
        <path d="M10 4C10 4 9 2.5 8 2" />
        <path d="M14 4C14 4 15 2.5 16 2" />
    </svg>
);

export const MeatsIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" {...props}>
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
    <svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="none" {...props}><path fill="#000000" d="M224 104h-8.37a88 88 0 0 0-175.26 0H32a8 8 0 0 0-8 8a104.35 104.35 0 0 0 56 92.28V208a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-3.72A104.35 104.35 0 0 0 232 112a8 8 0 0 0-8-8Zm-24.46 0h-51.42a71.84 71.84 0 0 1 41.27-29.57A71.45 71.45 0 0 1 199.54 104Zm-26.06-47.77q2.75 2.25 5.27 4.75a87.92 87.92 0 0 0-49.15 43h-29.5A72.26 72.26 0 0 1 168 56c1.83 0 3.66.09 5.48.23ZM128 40a71.87 71.87 0 0 1 19 2.57A88.36 88.36 0 0 0 83.33 104H56.46A72.08 72.08 0 0 1 128 40Zm36.66 152a8 8 0 0 0-4.66 7.3v8.7H96v-8.7a8 8 0 0 0-4.66-7.3a88.29 88.29 0 0 1-51-72h175.29a88.29 88.29 0 0 1-50.97 72Z" /></svg>
);

export const EggsIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" fill="none" {...props}><g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><circle cx="11.5" cy="12.5" r="3.5" /><path d="M3 8c0-3.5 2.5-6 6.5-6c5 0 4.83 3 7.5 5s5 2 5 6c0 4.5-2.5 6.5-7 6.5c-2.5 0-2.5 2.5-6 2.5s-7-2-7-5.5c0-3 1.5-3 1.5-5C3.5 10 3 9 3 8Z" /></g></svg>
);

export const CerealsIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 3V21" />
        <path d="M12 7C10.5 6 9 6.5 8 8" />
        <path d="M12 7C13.5 6 15 6.5 16 8" />
        <path d="M12 11C10.5 10 9 10.5 8 12" />
        <path d="M12 11C13.5 10 15 10.5 16 12" />
        <path d="M12 15C10.5 14 9 14.5 8 16" />
        <path d="M12 15C13.5 14 15 14.5 16 16" />
    </svg>
);

export const CandiesIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <g transform="rotate(-15 12 12)">
            <rect x="6" y="4" width="12" height="16" rx="2" />
            <path d="M6 11H18" />
            <path d="M6 17H18" />
            <path d="M12 8V20" />
            <path d="M9 4C8.5 5.5 9.5 7 11 6" />
            <path d="M11 4C10.5 5.5 11.5 7 13 6" />
            <path d="M13 4C12.5 5.5 13.5 7 15 6" />
        </g>
    </svg>
);

export const MilkIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M7 3H17L16 21H8L7 3Z" />
        <path d="M8 9C10 8 14 8 16 9" />
    </svg>
);

export const SeasoningIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9 3H15L17 7H7L9 3Z" />
        <path d="M7 7H17L16 21H8L7 7Z" />
        <circle cx="10" cy="5" r="0.5" />
        <circle cx="12" cy="5" r="0.5" />
        <circle cx="14" cy="5" r="0.5" />
        <path d="M18 10C19 11 19 12 18 13" />
        <path d="M20 11C21 12 21 13 20 14" />
    </svg>
);