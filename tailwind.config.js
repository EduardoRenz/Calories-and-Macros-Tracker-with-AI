
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'healthpal-dark': '#101614',
        'healthpal-panel': '#1A201C',
        'healthpal-card': '#25352D',
        'healthpal-border': '#34453D',
        'healthpal-green': '#AFFF34',
        'healthpal-protein': '#A076F9',
        'healthpal-carbs': '#F4A261',
        'healthpal-fats': '#E9C46A',
        'healthpal-text-primary': '#F0F0F0',
        'healthpal-text-secondary': '#A0A0A0',
      },
    },
  },
  plugins: [],
};
