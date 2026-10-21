import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        script: ['"Great Vibes"', "cursive"],
        sans: ["Montserrat", "system-ui", "sans-serif"],
      },
      keyframes: {
        "modal-in": {
          from: { opacity: "0", transform: "translate(-50%, -46%) scale(0.98)" },
          to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "modal-in": "modal-in 280ms ease-out",
        "fade-in": "fade-in 220ms ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
