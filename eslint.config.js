// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const boundaries = require('eslint-plugin-boundaries');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    plugins: {
      boundaries,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
      'boundaries/elements': [
        {
          type: 'core',
          pattern: 'src/app/core/**/*',
          mode: 'full',
        },
        {
          type: 'shared',
          pattern: 'src/app/shared/**/*',
          mode: 'full',
        },
        {
          type: 'layout',
          pattern: 'src/app/layout/**/*',
          mode: 'full',
        },
        {
          type: 'feature',
          pattern: 'src/app/features/*/**/*',
          mode: 'full',
          capture: ['featureName'],
        },
        {
          type: 'env',
          pattern: 'src/environments/**/*',
          mode: 'full',
        },
        {
          type: 'app',
          pattern: 'src/app/*',
          mode: 'full',
        },
      ],
      'boundaries/ignore': ['**/*.spec.ts'],
    },
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          message: '${file.type} is not allowed to import ${dependency.type}',
          rules: [
            {
              from: 'core',
              allow: ['core', 'shared', 'env'],
            },
            {
              from: 'shared',
              allow: ['shared', 'env'],
            },
            {
              from: 'layout',
              allow: ['core', 'shared', 'layout', 'env'],
            },
            {
              from: 'feature',
              allow: [
                'core',
                'shared',
                'layout',
                'env',
                ['feature', { featureName: '${from.featureName}' }],
              ],
            },
            {
              from: 'app',
              allow: ['core', 'shared', 'layout', 'env'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
