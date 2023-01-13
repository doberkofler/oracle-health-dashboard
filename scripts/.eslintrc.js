module.exports = {
	parserOptions: {
		allowAutomaticSingleRunInference: true,
		project: [
			'./scripts/tsconfig.json',
		]
	},
	env: {
		node: true,
	},
	rules: {
		'no-process-env': 'off',
	},
};
