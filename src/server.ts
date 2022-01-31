import debugModule from 'debug';
import express from 'express';
import compression from 'compression';
import {handlerDefault} from './router/handlerDefault.js';
import {handlerConfig} from './router/handlerConfig.js';
import {handlerDebug} from './router/handlerDebug.js';

import type * as http from 'http';
import type {configType} from './config/config.js';

const debug = debugModule('oracle-health-dashboard:server');

export async function serverStart(config: configType): Promise<{app: express.Express, server: http.Server}> {
	debug('startServer');

	return new Promise(resolve => {
		const app = express();

		// compression
		app.use(compression());

		// "static" route
		app.use('/static', express.static('static'));

		// "default" route
		app.get('/', handlerDefault.bind(null, config));

		// "config" route
		app.get('/config', handlerConfig.bind(null, config));

		// "debug" route
		app.get('/debug', handlerDebug.bind(null, config));

		// listen
		const server = app.listen(config.http_port, () => {
			resolve({app, server});
		});
	});
}

export async function serverStop(server: http.Server): Promise<void> {
	return new Promise(resolve => server.close(() => {
		resolve();
	}));
}
