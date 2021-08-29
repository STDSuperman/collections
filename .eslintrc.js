module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    node: true
  },
  plugins: ["@typescript-eslint"],
  rules: {
    'no-unused-vars': [
      1,
      { varsIgnorePattern: '.*', args: 'none' }
    ]
  },
  overrides: []
}