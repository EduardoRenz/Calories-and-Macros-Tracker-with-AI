import { useState, useEffect } from 'react';

export function useBreakpoint(breakpoint: 'sm' | 'md' | 'lg' | 'xl'): boolean | undefined {
    const [isBelow, setIsBelow] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        const checkBreakpoint = () => {
            const width = window.innerWidth;
            const breakpoints = {
                sm: 640,
                md: 768,
                lg: 1024,
                xl: 1280,
            };

            setIsBelow(width < breakpoints[breakpoint]);
        };

        checkBreakpoint();
        window.addEventListener('resize', checkBreakpoint);

        return () => window.removeEventListener('resize', checkBreakpoint);
    }, [breakpoint]);

    return isBelow;
}
