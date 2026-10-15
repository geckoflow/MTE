import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^(_|ignore)' },
      ],
      // Logos/Brand-Assets und Konfigurator-Vorschauen sind bewusst einfache <img>
      '@next/next/no-img-element': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    'node_modules/**',
    'prototype/**',
    'media/**',
    'src/payload-types.ts',
    'src/migrations/**',
    'src/app/(payload)/**',
    'playwright-report/**',
    'test-results/**',
    'next-env.d.ts',
  ]),
])
