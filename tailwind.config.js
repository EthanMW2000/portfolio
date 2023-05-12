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
        primary: "#6096B4",
        "secondary-blue": "#93BFCF",
        "third-blue": "#BDCDD6",
        "primary-tan": "#EEE9DA",
      },
      fontFamily: {
        sans: ["Montserrat", "Roboto", "sans-serif"],
      },
      backgroundImage: {
        wave: "url('/wave.svg')",
      },
    },
  },
  plugins: [],
};
