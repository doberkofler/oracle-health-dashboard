import glob from 'glob';
import path from 'path';
import fs from 'fs-extra';
import esbuild from 'esbuild';

type optionsType = {
	mode: 'production' | 'development',
};

const OUT_DIR = 'out';

/**
 * @param config - The configuration object.
 * @returns was the build succesful.
 */
const build = (config: esbuild.BuildOptions): boolean => {
	try {
		/*const results = */esbuild.buildSync(config);

		/*
		results.errors.forEach(console.error);
		results.warnings.forEach(console.warn);
		*/

		return true;
	} catch (e) {
		return false;
	}
};

const build_server = (options: optionsType): void => {
	fs.copySync('node_modules/oracledb/build', path.join(OUT_DIR, 'build'));

	const ok = build({
		entryPoints: {
			'server/index': './src/server/index.ts',
			'server/gatherer': './src/server/gatherer.ts',
			'root': './src/server/index.css',
		},
		bundle: true,
		minify: options.mode === 'production',
		platform: 'node',
		target: 'node16',
		packages: 'external',
		sourcemap: options.mode === 'production',
		outdir: OUT_DIR,
		logLevel: 'info',
	});

	console.log(`Build of server ${ok ? 'successful' : 'failed'}`);
};

const build_client = (options: optionsType): void => {
	const clientFiles = glob.sync('./src/client/pages/*/index.tsx');
	if (clientFiles.length === 0) {
		return;
	}

	const entryPoints = clientFiles.reduce<Record<string, string>>((prev, curr) => {
		const dir = path.dirname(curr);
		const pageName = path.basename(dir);

		prev[`client/${pageName}/index`] = curr;

		return prev;
	}, {});

	const ok = build({
		entryPoints,
		bundle: true,
		minify: options.mode === 'production',
		platform: 'browser',
		target: 'es2020',
		sourcemap: options.mode === 'production',
		outdir: OUT_DIR,
		logLevel: 'info',
	});

	console.log(`Build of client ${ok ? 'successful' : 'failed'}`);
};

/**
 * @param [error=''] - The error message.
 */
const usage = (error = ''): void => {
	if (typeof error === 'string' && error.length > 0) {
		console.log(error);
	}	
	console.log('Usage: ts-node build.ts');
};

const main = (): void => {
	const options: optionsType = {
		mode: 'production',
	};

	const args = process.argv.slice(2);
	for (const option of args) {
		switch (option) {
			case '--help':
				usage();
				break;

			case '--production':
				options.mode = 'production';
				break;

			case '--development':
				options.mode = 'development';
				break;

			default:
				break;
		}
	}

	build_server(options);
	build_client(options);
};

main();
