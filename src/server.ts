import debugModule from 'debug';
import {spawn, Thread, Worker} from 'threads';
import express from 'express';
import compression from 'compression';
import {configLoad} from './config.js';
import {handlerDefault} from './router/handlerDefault.js';
import {handlerDebug} from './router/handlerDebug.js';
import {gathererInitial} from './gatherer/gathererInitial.js';

import type {optionsType} from './options.js';
import type {Gatherer} from './gatherer/gathererWorker';

const debug = debugModule('oracle-health-dashboard:server');

export async function runServer(options: optionsType) {
	debug('runServer', options);

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

	// start gatherer thread
	debug('start gatherer thread');
	const gatherer = await spawn<Gatherer>(new Worker('./gatherer/gathererWorker'));
	await gatherer(config);

	const app = express();

	app.use(compression());

	// "static" route
	app.use('/static', express.static('static'));

	// "default" route
	app.get('/', handlerDefault.bind(null, config));

	// "debug" route
	app.get('/debug', handlerDebug.bind(null, config));

	const server = app.listen(config.http_port, () => {
		console.log(`Listening at http://127.0.0.1:${config.http_port}`);
	});

	async function shutDown() {
		console.log('Received kill signal, shutting down gracefully');

		// terminate gataherer thread
		console.log('Stopping gatherer thread...');
		await Thread.terminate(gatherer);
		console.log('Stopped gatherer thread.');

		// close server
		console.log('Closing server connection...');
		server.close(() => {
			console.log('Closed server connections.');
			process.exit(0);
		});
	}
}
