module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true
  },
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module',
    "ecmaFeatures": {
      "legacyDecorators": true
    }
  },
  plugins: [
    'vue'
  ],
  rules: {
    // 'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 'space-before-function-paren': [2, 'never'],
    // 'vue/max-attributes-per-line': 'off',
    // 'vue/array-bracket-spacing': 'error',
    // 'vue/arrow-spacing': 'error',
    // 'vue/block-spacing': 'error',
    // 'vue/brace-style': 'error',
    // 'vue/camelcase': 'error',
    // 'vue/comma-dangle': 'error',
    // 'vue/component-name-in-template-casing': 'error',
    // 'vue/eqeqeq': 'error',
    // 'vue/key-spacing': 'error',
    // 'vue/match-component-file-name': 'error',
    // 'vue/object-curly-spacing': 'error',
    // 'linebreak-style': [0, 'error', 'windows']
  },
  'extends': [
    'eslint:recommended',
    'plugin:vue/recommended',
    '@vue/standard',
    '@vue/typescript'
  ]
}
