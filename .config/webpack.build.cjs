const path = require('path');

module.exports = {
  extends: path.resolve(__dirname, "./webpack.base.cjs"),
  mode: 'production',
  output: {
      publicPath: './',
  },
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          publicPath: '../../'
        }
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new (require('terser-webpack-plugin'))({
        extractComments: false, // Prevents generating .LICENSE.txt files
      }),
    ],
  },
};