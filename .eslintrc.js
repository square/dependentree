module.exports = {
  plugins: ['square'],
  extends: ['plugin:square/base'],
  env: {
    node: true,
    browser: true,
  },
  rules: {
    'prettier/prettier': 0,
    'no-param-reassign': 'off',
    'no-unused-vars': 'off',
    'filenames/match-exported': 'off',
  },
  ignorePatterns: ['dist/', 'dev/', 'page/']
};
