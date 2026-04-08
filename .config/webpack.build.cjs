const path = require('path');

module.exports = {
  extends: path.resolve(__dirname, "./webpack.base.cjs"),
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new (require('terser-webpack-plugin'))({
        extractComments: false, // Prevents generating .LICENSE.txt files
      }),
    ],
  },
};