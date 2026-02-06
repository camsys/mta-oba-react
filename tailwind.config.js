/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    'no-underline',
    'inline-block',
  ],
  theme: {
    screens: {
      'three': '300px',
      'six': '600px',
      'nine': '900px',
      'ten': '1000px',
    },
    extend: {
      colors: {
        'black2': '#1f2026',
        'black3': '#2f3139',
        'black4': '#36373c',
        'black5': '#4a4a4a',
        'mta-dark-blue': '#0e61a9',
        'mta-dark-blue2': '#0f61a9',
        'mta-blue': '#2b60a4',
        'mta-blue2': '#3b9dfd',
        'mta-light-blue': '#577bb8',
        'mta-yellow': '#f2a900',
        'mta-green': '#46a739',
        'shuttle-gray': '#737384',
        'alert-red': '#ec1c24',

      },
      spacing: {
        'content': '1rem', 
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}