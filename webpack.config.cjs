const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, './src/index.ts'),
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/',
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'build/index.html'), // Path to your source HTML file
    }),
    new CopyWebpackPlugin({
      patterns: [
        {from: './src/assets', to: './assets'}
      ]
    }),
  ],
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    port: 80,
    open: false,
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