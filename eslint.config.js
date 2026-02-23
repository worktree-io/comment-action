import config from 'eslint-config-agent'
import globals from 'globals'

export default [
  ...config,
  {
    files: ['src/azure/**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
        fetch: 'readonly',
      },
    },
  },
  {
    ignores: ['dist/**'],
  },
]
