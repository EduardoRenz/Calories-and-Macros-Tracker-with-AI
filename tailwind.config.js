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
                'healthpal-dark': 'var(--healthpal-dark)',
                'healthpal-panel': 'var(--healthpal-panel)',
                'healthpal-card': 'var(--healthpal-card)',
                'healthpal-border': 'var(--healthpal-border)',
                'healthpal-green': 'var(--healthpal-green)',
                'healthpal-protein': 'var(--healthpal-protein)',
                'healthpal-carbs': 'var(--healthpal-carbs)',
                'healthpal-fats': 'var(--healthpal-fats)',
                'healthpal-yellow': 'var(--healthpal-yellow)',
                'healthpal-text-primary': 'var(--healthpal-text-primary)',
                'healthpal-text-secondary': 'var(--healthpal-text-secondary)',
            },
        },
    },
    plugins: [],
}
