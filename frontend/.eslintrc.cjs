module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: ['plugin:@typescript-eslint/recommended'],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
  },
};

