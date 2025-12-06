const globals = require('globals')

module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.es2020, // Thêm các biến toàn cục ES2020
        ...globals.node // Thêm các biến toàn cục Node.js
      }
    },
    rules: {
      'no-useless-catch': 0,
      'no-console': 1,
      'no-extra-boolean-cast': 0,
      'no-lonely-if': 1,
      'no-unused-vars': 1,
      'no-trailing-spaces': 1,
      'no-multi-spaces': 1,
      'no-multiple-empty-lines': 1,
      'space-before-blocks': ['error', 'always'],
      'object-curly-spacing': [1, 'always'],
      indent: ['warn', 2],
      semi: [1, 'never'],
      quotes: ['error', 'single'],
      'array-bracket-spacing': 1,
      'linebreak-style': 0,
      'no-unexpected-multiline': 'warn',
      'keyword-spacing': 1,
      'comma-dangle': 1,
      'comma-spacing': 1,
      'arrow-spacing': 1
    }
  }
]
