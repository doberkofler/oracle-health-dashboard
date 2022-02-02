'use strict';

const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function (env, options) {
	return {
		mode: 'production',
		entry: './src/index.ts',
		target: 'node',
		output: {
			path: path.resolve('dist'),
			filename: 'index.js',
			clean: true,
		},
		resolve: {
			extensions: ['.js', '.ts', '.tsx'],
		},
		module: {
			rules: [
				{
					test: /.tsx?$/i,
					use: [
						{
							loader: 'ts-loader',
							options: {
								transpileOnly: true,
								removeComments: true,
							}
						},
					]
				},
			],
		},
		plugins: [
			new CopyWebpackPlugin({
				patterns: [
					{
						from: path.resolve(__dirname, 'node_modules/oracledb/build'),
						to: 'node_modules/oracledb/build',
					},
					{
						from: path.resolve(__dirname, 'static'),
						to: 'static',
					},
				]
			}),
		],
		optimization: {
			minimize: false,
		},
		stats: {
			errorDetails: true,
		},
		devtool: false,
	};
};
