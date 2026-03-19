const path = require('path');

module.exports = {
  plugins: {
    [require.resolve('tailwindcss', { paths: [__dirname] })]: {},
    [require.resolve('autoprefixer', { paths: [__dirname] })]: {},
  },
};
