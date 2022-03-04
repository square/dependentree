const path = require('path');

const pathToDev = path.resolve(__dirname, '../dev');

module.exports = {
  entry: './data/index.js',
  output: {
    library: {
      name: 'testData',
      export: 'default',
      type: 'umd',
    },
    path: pathToDev,
    filename: 'testData.js',
  },
  devtool: 'inline-source-map',
  mode: 'development',
};
