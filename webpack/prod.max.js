const merge = require('webpack-merge');
const common = require('./common');
const path = require('path');

module.exports = merge(common, {
  mode: 'none',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'dependentree.js',
  },
});
