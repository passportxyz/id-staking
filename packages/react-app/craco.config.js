const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const path = require("path");

module.exports = {
  style: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  webpack: {
    configure: config => {
      config.plugins
        .filter(plugin => plugin.constructor.name === "ForkTsCheckerWebpackPlugin")
        .forEach(plugin => {
          plugin.options.typescript = plugin.options.typescript || {};
          plugin.options.typescript.memoryLimit = 4096;
        });

      return config;
    },
  },
};
