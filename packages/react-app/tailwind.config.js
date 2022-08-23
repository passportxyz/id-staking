const colors = require("tailwindcss/colors");

module.exports = {
  purge: {
    content: ["./src/**/*.{js,jsx}", "./public/index.html"],

    options: {},
  },

  darkMode: false, // or 'media' or 'class'

  theme: {
    extend: {
      backgroundImage: {},

      colors: {
        orange: colors.orange,

        green: {
          "050": "#6dc5a0",

          "dark-green": "#337062",
        },
      },
    },

    fontFamily: {
      spacemono: ["Space Mono"],

      librefranklin: ["Libre Franklin"],
    },

    minHeight: {
      0: "0",

      "1/4": "25%",

      "1/2": "50%",

      "3/4": "75%",

      full: "100%",

      intro: "890px",

      "intro-mobile": "450px",
    },
  },

  variants: {
    extend: {},
  },

  plugins: [],
};
