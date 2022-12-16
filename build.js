//@ts-check
/*eslint-env node*/

const glob = require('glob');
const path = require('path');
const fs = require('fs-extra');
const esbuild = require('esbuild');

const OUT_DIR = 'out';

/**
 * @param {esbuild.BuildOptions} config - The configuration object.
 * @returns {boolean} Was the build succesful.
 */
const build = config => {
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

const build_server = () => {
	fs.copySync('node_modules/oracledb/build', path.join(OUT_DIR, 'build'));

	const ok = build({
		entryPoints: {
			'server/index': './src/index.ts',
			'server/gatherer': './src/gatherer/gatherer.ts',
			'root': './src/root.css',
		},
		bundle: true,
		write: true,
		minify: true,
		platform: 'node',
		target: 'node16',
		sourcemap: true,
		outdir: OUT_DIR,
		logLevel: 'info',
	});

	console.log(`Build of server ${ok ? 'successful' : 'failed'}`);
};

const build_client = () => {
	const clientFiles = glob.sync('./src/pages/*/client.tsx');
	if (clientFiles.length === 0) {
		return;
	}

	const entryPoints = clientFiles.reduce((prev, curr) => {
		const dir = path.dirname(curr);
		const pageName = path.basename(dir);

		prev[`client/${pageName}/index`] = curr;

		return prev;
	}, {});

	const ok = build({
		entryPoints,
		bundle: true,
		write: true,
		minify: true,
		platform: 'browser',
		target: 'es2020',
		sourcemap: true,
		outdir: OUT_DIR,
		logLevel: 'info',
	});

	console.log(`Build of client ${ok ? 'successful' : 'failed'}`);
};

/**
 * @param {string} [error=''] - The error message.
 */
 const usage = (error = '') => {
	if (typeof error === 'string' && error.length > 0) {
		console.log(error);
	}	
	console.log(`Usage: node build.cjs`);
};

const main = () => {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		build_server();
		build_client();
	} else if (args[0] === 'server') {
		build_server();
	} else if (args[0] === 'client') {
		build_client();
	} else {
		usage();
	}
};

main();
