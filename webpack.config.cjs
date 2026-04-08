const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, './src/index.ts'),
  output: {
    filename: 'dist/app.js',
    path: path.resolve(__dirname, '.'),
    publicPath: './',
    clean: false,
    assetModuleFilename: 'dist/assets/[name][ext]',
  },
  // devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          publicPath: '../../'
        }
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'build/index.html'),
      filename: 'index.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'dist/assets/style.css',
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