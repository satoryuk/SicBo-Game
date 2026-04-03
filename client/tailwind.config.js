/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "sicbo-dark": "#0d0d0d",
        "sicbo-green": "#0e3522",
        "sicbo-green-dark": "#0b2a1a",
        "sicbo-gold": "#c9a84c",
        "sicbo-gold-dark": "#8a6a1f",
        "sicbo-text": "#f5e6c8",
        "sicbo-text-muted": "#a08050",
      },
      fontFamily: {
        cinzel: ["Cinzel", "serif"],
        noto: ["Noto Serif TC", "serif"],
      },
    },
  },
  plugins: [],
};
