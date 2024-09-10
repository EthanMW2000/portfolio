/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: "360px",
      sm: "601px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        primary: "#1b2541",
        secondary: "#f1f1ef",
        "primary-button": "#048a95",
        "secondary-button": "#9bd0d4",
        accent: "#e37224",
      },
      fontFamily: {
        sans: ["Inter", "Roboto", "Montserrat", "sans-serif"],
      },
      backgroundImage: {
        noise: "url('/nnnoise.svg')",
      },
      textShadow: {
        outline: "0.5px 0.5px 0px rgba(0, 0, 0, 1)",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".text-shadow-outline": {
          textShadow: "0.5px 0.5px 0px rgba(0, 0, 0, 1)",
        },
      };

      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
};
