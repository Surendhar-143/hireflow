/** @type {import("eslint").Linter.Config} */
const base = {
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
  },
}

const react = {
  ...base,
  env: {
    ...base.env,
    browser: true,
  },
  extends: [
    ...base.extends,
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  plugins: [...base.plugins, 'react', 'react-hooks', 'react-refresh'],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    ...base.rules,
    'react/react-in-jsx-scope': 'off',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
}

module.exports = {
  base,
  react,
}
