/** @type {import('tailwindcss').Config} */
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
                'neutral-dark': 'var(--neutral-dark)',
                'neutral-panel': 'var(--neutral-panel)',
                'neutral-card': 'var(--neutral-card)',
                'neutral-border': 'var(--neutral-border)',
                'brand-green': 'var(--brand-green)',
                'brand-protein': 'var(--brand-protein)',
                'brand-fiber': 'var(--brand-fiber)',
                'brand-carbs': 'var(--brand-carbs)',
                'brand-fats': 'var(--brand-fats)',
                'brand-yellow': 'var(--brand-yellow)',
                'neutral-text-primary': 'var(--neutral-text-primary)',
                'neutral-text-secondary': 'var(--neutral-text-secondary)',
                'brand-primary': 'var(--brand-green)',
                'brand-background': 'var(--neutral-dark)',
            },
        },
    },
    plugins: [],
}
