module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
		sourceType: 'module',
		extraFileExtensions: ['.cjs'],
	},

	plugins: [
	],
	settings: {
		react: {
			'version': 'detect',
		},
	},
	plugins: [
		'@typescript-eslint',
		'react',
		'react-hooks',
		'jest',
	],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/all',
		'plugin:react/all',
		'plugin:jest/recommended',
	],
	'rules': {
		'semi': ['error', 'always'],
		'@typescript-eslint/block-spacing': ['error', 'never'],
		'@typescript-eslint/comma-dangle': ['warn', {
			arrays: 'only-multiline',
			objects: 'only-multiline',
			imports: 'only-multiline',
			exports: 'only-multiline',
			functions: 'only-multiline',
			enums: 'only-multiline',
		}],
	'@typescript-eslint/consistent-type-definitions': 'off',
	'@typescript-eslint/indent': ['error', 'tab'],
	'@typescript-eslint/init-declarations': 'off',
	'@typescript-eslint/member-delimiter-style': ['error',
		{
			singleline: {
				delimiter: 'comma',
				requireLast: false
			},
			multiline: {
				delimiter: 'comma',
				requireLast: true
			}
		}
	],
	'@typescript-eslint/member-ordering': 'off',
	'@typescript-eslint/naming-convention': 'off',
	'@typescript-eslint/no-extra-parens': 'off',
	'@typescript-eslint/no-magic-numbers': 'off',
	'@typescript-eslint/no-type-alias': 'off',
	'@typescript-eslint/no-unnecessary-condition': 'off',
	'@typescript-eslint/no-use-before-define': 'off',
	'@typescript-eslint/quotes': ['error', 'single', 'avoid-escape'],
	'@typescript-eslint/prefer-readonly-parameter-types': 'off',
	'@typescript-eslint/restrict-template-expressions': 'off',
	'@typescript-eslint/space-before-function-paren': ['error', {'anonymous': 'always', 'named': 'never'}],
	'@typescript-eslint/sort-type-constituents': 'off',
	'@typescript-eslint/sort-type-union-intersection-members': 'off',
	'react/function-component-definition': 'off',
	'react/jsx-filename-extension': ['error', {extensions: ['.jsx', '.tsx']}],
	'react/jsx-indent': ['error', 'tab'],
	'react/jsx-max-depth': 'off',
	'react/jsx-max-props-per-line': 'off',
	'react/jsx-newline': 'off',
	'react/jsx-no-bind': 'off',
	'react/jsx-no-literals': 'off',
	'react/jsx-one-expression-per-line': 'off',
	'react/jsx-sort-props': 'off',
	'react/no-multi-comp': 'off',
	'react/require-default-props': 'off',
  }
};
