/* eslint-env node */
module.exports = {
	root: true,
	extends: ['eslint:recommended', 'airbnb-base', 'prettier'],
	rules: {
		'import/no-extraneous-dependencies': ['warn', { packageDir: './' }]
	},
	overrides: [
		{
			files: ['./**/*.{ts,tsx,cts}'],
			extends: [
				'plugin:@typescript-eslint/recommended',
				'airbnb-typescript/base',
				'plugin:@typescript-eslint/recommended-requiring-type-checking',
				'prettier'
			],
			parser: '@typescript-eslint/parser',
			parserOptions: { project: './tsconfig.eslint.json' },
			plugins: ['@typescript-eslint'],
			rules: {
				'import/no-extraneous-dependencies': ['warn', { packageDir: './' }]
			}
		}
	],
	ignorePatterns: ['dist', 'node_modules']
};
