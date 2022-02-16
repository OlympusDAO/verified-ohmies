const withFonts = require('next-fonts');

module.exports = 
  withFonts(
    {
      distDir: "build",
      webpack(config, options) {
        return config;
      }
    }
  );
