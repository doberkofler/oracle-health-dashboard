import debugModule from 'debug';
import {spawn, Thread, Worker} from 'threads';
import {configLoad} from './config.js';
import {gathererInitial} from './gatherer/initialize.js';
import {serverStart, serverStop} from './server.js';
import {installShutdown} from './shutdown.js';

import type {Gatherer} from './gatherer/gathererWorker';

const debug = debugModule('oracle-health-dashboard:runserver');

export async function runServer(configFilename: string) {
	debug('runServer', configFilename);

	// install shutdown handler
	installShutdown(shutdownHandler);

	// load configuration
	debug('load configuration');
	const config = configLoad(configFilename);

	// initialize gatherer
	debug('initialize gatherer');
	await gathererInitial(config);

	// start gatherer thread
	debug('start gatherer thread');
	const gatherer = await spawn<Gatherer>(new Worker('./gatherer/gathererWorker'));
	await gatherer(config);

	// start srever
	const {server} = await serverStart(config);
	console.log(`Listening at http://127.0.0.1:${config.http_port}`);

	async function shutdownHandler() {
		// terminate gataherer thread
		console.log('Stopping gatherer thread...');
		await Thread.terminate(gatherer);
		console.log('Stopped gatherer thread.');

		// close server
		console.log('Closing server connection...');
		await serverStop(server);
		console.log('Closed server connections.');
	}
}
