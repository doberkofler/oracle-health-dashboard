import debugModule from 'debug';
import {configLoad} from './config.js';
import {gathererInitial} from './gatherer/gathererInitial.js';

import type {optionsType} from './options.js';

const debug = debugModule('oracle-health-dashboard:ping');

export async function runPing(options: optionsType) {
	debug('runPing', options);

	// install signal event handler
	debug('install signal event handler');
	process.on('SIGTERM', shutDown);
	process.on('SIGINT', shutDown);

	// load configuration
	debug('load configuration');
	const config = configLoad(options.config);

	// initialize gatherer
	debug('initialize gatherer');
	await gathererInitial(config);
}

async function shutDown() {
	console.log('Received kill signal, shutting down gracefully');

	process.exit(0);
}
