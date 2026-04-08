const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const __root = path.resolve(__dirname, '..');

module.exports = {
  entry: path.resolve(__root, './src/index.ts'),
  output: {
    filename: 'dist/app.js',
    path: path.resolve(__root, '.'),
    publicPath: './',
    clean: false,
    assetModuleFilename: 'dist/assets/[name][ext]',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'tsconfig.json'),
          }
        },
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
      template: path.resolve(__root, 'build/index.html'),
      filename: 'index.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'dist/assets/style.css',
    }),
  ],
};