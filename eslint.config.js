import js from '@eslint/js'
import tseslint from 'typescript-eslint'

/**
 * ESLint v9 flat config
 * Enforces separation: client code MUST NOT import server code directly.
 * Use shared interfaces from `src/shared` instead.
 */
export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    files: ['src/client/**/*.ts', 'src/client/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/src/server/**', '**/server/**', '@/server/**', '../../server/**', '../server/**'],
              message:
                'Client code MUST NOT import from server. Move shared contracts to src/shared and import from there.',
            },
          ],
        },
      ],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': false,
        },
      ],
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'build/', '.tanstack/'],
  },
)
