const merge = require('webpack-merge');
const devLib = require('./dev-lib');
const path = require('path');

const pathToTestPage = path.resolve(__dirname, '../tests/page');

module.exports = merge(devLib, {
  output: {
    path: pathToTestPage,
  },
});
