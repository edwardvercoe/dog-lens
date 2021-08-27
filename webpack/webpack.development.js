'use strict';

const HtmlWebpackPlugin = require('html-webpack-plugin');

const development = {
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
  ],
  devServer: {
    host: '0.0.0.0', //your ip address
    port: 8080,
    disableHostCheck: true,
    https: true,
    historyApiFallback: true,
  },
  devtool: 'inline-source-map',
};

module.exports = development;
