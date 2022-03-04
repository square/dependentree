const merge = require('webpack-merge');
const common = require('./common');
const path = require('path');

const pathToDev = path.resolve(__dirname, '../dev');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    contentBase: './dist',
  },
  output: {
    path: pathToDev,
    filename: '[name].js',
  },
});
