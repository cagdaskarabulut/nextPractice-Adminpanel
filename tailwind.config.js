/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      
        colors: {
          "admin-dark-blue": {
            900: "#0D1F36",
            800: "#12263F",
            700: "#183054",
            600: "#1D3A6A",
            500: "#2E4780",
          },
          "admin-blue": {
            500: "#3378FF",
            400: "#4A8CFF",
            300: "#75AAFF",
          },
          "admin-gray": {
            100: "#F7F9FC",
            200: "#EAF0F7",
            300: "#D9E2EC",
            400: "#B3C2D1",
            500: "#8696A7",
          },
        },
        fontFamily: {
          sans: ["Inter", "sans-serif"],
        },
        boxShadow: {
          card: "0 2px 5px 0 rgba(0,0,0,0.05)",
          "card-hover": "0 5px 15px 0 rgba(0,0,0,0.1)",
        },
      colors: {
        "admin-dark-blue": {
          900: "#0D1F36",
          800: "#12263F",
          700: "#183054",
          600: "#1D3A6A",
          500: "#2E4780",
        },
        "admin-blue": {
          500: "#3378FF",
          400: "#4A8CFF",
          300: "#75AAFF",
        },
        "admin-gray": {
          100: "#F7F9FC",
          200: "#EAF0F7",
          300: "#D9E2EC",
          400: "#B3C2D1",
          500: "#8696A7",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 5px 0 rgba(0,0,0,0.05)",
        "card-hover": "0 5px 15px 0 rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [],
};
