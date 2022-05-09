module.exports = {
  content: ["./src/web/**/*.tsx", "./src/pages/**/*.tsx"],
  darkMode: "media", // or 'media' or 'class'
  theme: {
    extend: {
      backgroundImage: {
        quri: "url('/icons/logo.svg')",
      },
      maxWidth: {
        160: "160px",
      },
    },
  },
  variants: {
    extend: {},
    margin: ["responsive", "hover"],
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
