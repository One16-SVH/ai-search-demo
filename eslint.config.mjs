import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            { sourceTag: 'type:domain', onlyDependOnLibsWithTags: ['type:domain'] },
            { sourceTag: 'type:application', onlyDependOnLibsWithTags: ['type:domain','type:application'] },
            { sourceTag: 'type:infrastructure', onlyDependOnLibsWithTags: ['type:domain','type:application','type:infrastructure'] },
            { sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:application','type:ui', 'type:domain'] },
            { sourceTag: 'type:app', onlyDependOnLibsWithTags: ['type:domain','type:application','type:infrastructure','type:ui'] }
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
