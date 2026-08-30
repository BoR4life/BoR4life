import { FlatCompat } from '@eslint/eslintrc';
import security from 'eslint-plugin-security';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    plugins: { security },
    rules: {
      ...security.configs.recommended.rules,
      // Flags string-built RegExp — the pattern this site actually uses is
      // static/trusted, so this specific rule generates noise without value.
      'security/detect-non-literal-regexp': 'off',
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'public/**'],
  },
];
