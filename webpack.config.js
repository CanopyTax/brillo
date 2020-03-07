const { resolve } = require('path');

const config = {};

config.mode = 'development';
config.entry = {
  main: resolve(__dirname, 'src/main.js'),
  renderer: resolve(__dirname, 'src/renderer.js'),
};
config.output = {
  path: resolve(__dirname, 'build'),
  filename: '[name].js',
  library: 'brillo',
  libraryTarget: 'commonjs2',
};

config.target = 'electron-main';

config.module = {
  rules: [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
      },
    },
  ],
};

module.exports = config;