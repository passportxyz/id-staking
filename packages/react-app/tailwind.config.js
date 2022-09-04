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
        divider: "rgba(0, 0, 0, 0.06)",
        asideBorder: "#D5BDFF",
        asideBG: "#F6F0FF",
        orange: colors.orange,
        signout: "#FF4D4F",
        purple: {
          darkpurple: "#0E0333",
          connectPurple: "#6F3FF5",
          gitcoinpurple: "#6f3ff5",
        },
        green: {
          "050": "#6dc5a0",
          "dark-green": "#337062",
        },
        blue: {
          alertBg: "#E6F7FF",
          alertBorder: "#91D5FF",
        },
      },
    },

    fontFamily: {
      spacemono: ["Space Mono"],

      librefranklin: ["Libre Franklin"],
    },

    maxWidth: {
      aside: "22rem",
      button: "13rem",
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
