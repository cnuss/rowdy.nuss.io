import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import globals from 'globals';
import jest from 'eslint-plugin-jest';
import prettier from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

export default defineConfig([
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: globals.node },
  },
  {
    files: ['tests/**'],
    ...jest.configs['flat/all'],
    languageOptions: {
      parserOptions: { project: './tsconfig.json' },
    },
  },
  prettier,
  { ignores: ['dist/'] },
]);
