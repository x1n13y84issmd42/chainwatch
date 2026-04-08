const path = require('path');

const __root = path.resolve(__dirname, '..');

module.exports = {
  extends: path.resolve(__dirname, "./webpack.base.cjs"),
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
      publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  devServer: {
    port: 80,
    open: false,
  },
};