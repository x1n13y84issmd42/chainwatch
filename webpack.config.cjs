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
    publicPath: '/',
    clean: false,
    assetModuleFilename: 'dist/assets_module'
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'], // Processes CSS
      },
      // You can still use Asset Modules for images inside your CSS
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
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
    // new CopyWebpackPlugin({
    //   patterns: [
    //     {from: './src/assets', to: './dist/assets'}
    //   ]
    // }),
    new MiniCssExtractPlugin({
      filename: 'src/assets/style.css',
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