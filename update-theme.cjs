const fs = require('fs');

const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Surface */
  --surface: #f8fafa;
  --surface-dim: #d8dada;
  --surface-bright: #f8fafa;
  --surface-container-lowest: #ffffff;
  --surface-container-low: #f2f4f4;
  --surface-container: #eceeee;
  --surface-container-high: #e6e8e8;
  --surface-container-highest: #e1e3e3;
  --on-surface: #191c1d;
  --on-surface-variant: #3e4948;
  --inverse-surface: #2e3131;
  --inverse-on-surface: #eff1f1;
  --surface-tint: #096967;
  --surface-variant: #e1e3e3;
  --background: #f8fafa;
  --on-background: #191c1d;

  /* Primary */
  --primary: #004c4b;
  --on-primary: #ffffff;
  --primary-container: #006664;
  --on-primary-container: #93e1de;
  --inverse-primary: #86d4d1;
  --primary-fixed: #a2f0ed;
  --primary-fixed-dim: #86d4d1;
  --on-primary-fixed: #00201f;
  --on-primary-fixed-variant: #00504e;

  /* Secondary */
  --secondary: #006c45;
  --on-secondary: #ffffff;
  --secondary-container: #69fdb4;
  --on-secondary-container: #007349;
  --secondary-fixed: #69fdb4;
  --secondary-fixed-dim: #47df9a;
  --on-secondary-fixed: #002112;
  --on-secondary-fixed-variant: #005233;

  /* Tertiary */
  --tertiary: #324a00;
  --on-tertiary: #ffffff;
  --tertiary-container: #446400;
  --on-tertiary-container: #a2e700;
  --tertiary-fixed: #b0f820;
  --tertiary-fixed-dim: #98da00;
  --on-tertiary-fixed: #131f00;
  --on-tertiary-fixed-variant: #344e00;

  /* Error */
  --error: #ba1a1a;
  --on-error: #ffffff;
  --error-container: #ffdad6;
  --on-error-container: #93000a;

  /* Outline */
  --outline: #6f7978;
  --outline-variant: #bec9c7;

  /* Custom Macros (DO NOT TOUCH) */
  --brand-protein: #4CAF50;
  --brand-carbs: #FF8C42;
  --brand-fats: #FFC107;
  --brand-fiber: #deeb6d;
  
  /* Legacy Map (So old classes adopt the light theme immediately) */
  --neutral-dark: var(--background);
  --neutral-panel: var(--surface-container);
  --neutral-card: var(--surface-container-lowest);
  --neutral-border: var(--outline-variant);
  --neutral-text-primary: var(--on-surface);
  --neutral-text-secondary: var(--on-surface-variant);
  --brand-green: var(--primary);
  --brand-orange: var(--secondary);
  --brand-yellow: var(--tertiary);

  /* Fonts */
  --font-headline: 'Nara', sans-serif;
}

/* Dark mode fallback (to be expanded later) */
.dark {
  /* Setting dark backgrounds so if dark mode is toggled, it doesn't flash white */
  --background: #191c1d;
  --surface: #191c1d;
  --surface-container-lowest: #0e1111;
  --surface-container: #1d2020;
  --on-surface: #e1e3e3;
  --on-surface-variant: #bec9c7;
  --primary: #86d4d1;
  --on-primary: #003736;
  --primary-container: #00504e;
  --on-primary-container: #a2f0ed;
}

@layer base {
  body {
    @apply bg-background text-on-surface font-body;
    touch-action: manipulation;
  }
  
  * {
    -webkit-tap-highlight-color: transparent;
  }
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--surface-container);
}

::-webkit-scrollbar-thumb {
  background: var(--outline-variant);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--outline);
}
`;

fs.writeFileSync('styles/globals.css', globalsCss);

const tailwindConfig = \`/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./contexts/**/*.{js,ts,jsx,tsx}",
        "./hooks/**/*.{js,ts,jsx,tsx}",
        "./domain/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Semantic Colors from Material 3
                'surface': 'var(--surface)',
                'surface-dim': 'var(--surface-dim)',
                'surface-bright': 'var(--surface-bright)',
                'surface-container-lowest': 'var(--surface-container-lowest)',
                'surface-container-low': 'var(--surface-container-low)',
                'surface-container': 'var(--surface-container)',
                'surface-container-high': 'var(--surface-container-high)',
                'surface-container-highest': 'var(--surface-container-highest)',
                'on-surface': 'var(--on-surface)',
                'on-surface-variant': 'var(--on-surface-variant)',
                'inverse-surface': 'var(--inverse-surface)',
                'inverse-on-surface': 'var(--inverse-on-surface)',
                'surface-tint': 'var(--surface-tint)',
                'surface-variant': 'var(--surface-variant)',
                'background': 'var(--background)',
                'on-background': 'var(--on-background)',
                'primary': 'var(--primary)',
                'on-primary': 'var(--on-primary)',
                'primary-container': 'var(--primary-container)',
                'on-primary-container': 'var(--on-primary-container)',
                'inverse-primary': 'var(--inverse-primary)',
                'primary-fixed': 'var(--primary-fixed)',
                'primary-fixed-dim': 'var(--primary-fixed-dim)',
                'on-primary-fixed': 'var(--on-primary-fixed)',
                'on-primary-fixed-variant': 'var(--on-primary-fixed-variant)',
                'secondary': 'var(--secondary)',
                'on-secondary': 'var(--on-secondary)',
                'secondary-container': 'var(--secondary-container)',
                'on-secondary-container': 'var(--on-secondary-container)',
                'secondary-fixed': 'var(--secondary-fixed)',
                'secondary-fixed-dim': 'var(--secondary-fixed-dim)',
                'on-secondary-fixed': 'var(--on-secondary-fixed)',
                'on-secondary-fixed-variant': 'var(--on-secondary-fixed-variant)',
                'tertiary': 'var(--tertiary)',
                'on-tertiary': 'var(--on-tertiary)',
                'tertiary-container': 'var(--tertiary-container)',
                'on-tertiary-container': 'var(--on-tertiary-container)',
                'tertiary-fixed': 'var(--tertiary-fixed)',
                'tertiary-fixed-dim': 'var(--tertiary-fixed-dim)',
                'on-tertiary-fixed': 'var(--on-tertiary-fixed)',
                'on-tertiary-fixed-variant': 'var(--on-tertiary-fixed-variant)',
                'error': 'var(--error)',
                'on-error': 'var(--on-error)',
                'error-container': 'var(--error-container)',
                'on-error-container': 'var(--on-error-container)',
                'outline': 'var(--outline)',
                'outline-variant': 'var(--outline-variant)',

                // Legacy variables to keep old classes working while migrating
                'neutral-dark': 'var(--neutral-dark)',
                'neutral-panel': 'var(--neutral-panel)',
                'neutral-card': 'var(--neutral-card)',
                'neutral-border': 'var(--neutral-border)',
                'neutral-text-primary': 'var(--neutral-text-primary)',
                'neutral-text-secondary': 'var(--neutral-text-secondary)',
                
                // Macros & specific branding
                'brand-green': 'var(--brand-green)',
                'brand-orange': 'var(--brand-orange)',
                'brand-yellow': 'var(--brand-yellow)',
                'brand-protein': 'var(--brand-protein)',
                'brand-fiber': 'var(--brand-fiber)',
                'brand-carbs': 'var(--brand-carbs)',
                'brand-fats': 'var(--brand-fats)',
                'brand-primary': 'var(--primary)',
                'brand-background': 'var(--background)',
            },
            fontFamily: {
                headline: ['var(--font-headline)', 'sans-serif'],
                body: ['var(--font-body)', 'sans-serif'],
                label: ['var(--font-label)', 'sans-serif'],
            },
            borderRadius: {
                'sm': '0.5rem',
                DEFAULT: '1rem',
                'md': '1.5rem',
                'lg': '2rem',
                'xl': '3rem',
                'full': '9999px',
            },
            spacing: {
                'unit': '4px',
                'xs': '4px',
                'sm': '8px',
                'md': '16px',
                'lg': '24px',
                'xl': '40px',
                'gutter': '20px',
                'margin': '24px',
            },
            boxShadow: {
                'ambient': '0 4px 20px rgba(0, 76, 75, 0.05), 0 1px 3px rgba(0, 76, 75, 0.02)',
            }
        },
    },
    plugins: [],
}
\`;

fs.writeFileSync('tailwind.config.js', tailwindConfig);
console.log('CSS and Tailwind Config updated.');
