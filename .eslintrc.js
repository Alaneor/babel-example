'use strict'

module.exports = {

  // We must use Babel's parser in order to have support for async functions
  parser: 'babel-eslint',
  // This plugin provides fixes for some rules which do not work properly with async functions
  // The rules are defined below.
  plugins: [
    'babel'
  ],

  // Standard set of rules to use
  extends: [
    '@strv/javascript/environments/nodejs/latest',
    '@strv/javascript/environments/nodejs/best-practices',
    '@strv/javascript/environments/nodejs/optional',
    '@strv/javascript/coding-styles/base'
  ],

  rules: {
    // If your editor cannot show these to you, occasionally turn this off and run the linter
    'no-warning-comments': 0,

    // These syntax features are still not transpiled - destructuring assignment and object/rest
    // spread
    // Adding support for these should be trivial at this point.
    'no-restricted-syntax': [
      2,
      'ObjectPattern',
      'ExperimentalRestProperty'
    ],
    // Fix false positives for some ESLint rules - they do not properly handle async functions
    'arrow-parens': 0,
    'babel/arrow-parens': [1, 'as-needed'],
    'generator-star-spacing': 0,
    'babel/generator-star-spacing': [1, {
      before: false,
      after: true
    }]
  }
}
