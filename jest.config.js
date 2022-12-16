const config = {
	preset: 'ts-jest/presets/js-with-ts-esm',
	transform: {
		'\\.[jt]sx?$': [
			'ts-jest',
			{
				useESM: true,
			},
		],
	},
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
	coverageDirectory: 'coverage',
	collectCoverageFrom: [
		'src/**/*.{ts,tsx}',
		'!src/**/*.d.ts',
	],
};

module.exports = config;
