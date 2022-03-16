module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/web/display/**/*.{js,ts,jsx,tsx}",
    "./src/web/icons/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "media", // or 'media' or 'class'
  theme: {
    extend: {
      backgroundImage: {
        quri: "url('/icons/logo.svg')",
      },
    },
  },
  variants: {
    extend: {},
    margin: ["responsive", "hover"],
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
