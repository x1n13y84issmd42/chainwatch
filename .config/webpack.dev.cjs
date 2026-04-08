const path = require('path');

const __root = path.resolve(__dirname, '..');

module.exports = {
  extends: path.resolve(__dirname, "./webpack.base.cjs"),
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: path.resolve(__root, '.'),
    port: 80,
    open: false,
  },
};