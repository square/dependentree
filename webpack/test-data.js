const merge = require('webpack-merge');
const devData = require('./dev-data');
const path = require('path');

const pathToTestPage = path.resolve(__dirname, '../tests/page');

module.exports = merge(devData, {
  output: {
    path: pathToTestPage,
  },
});

