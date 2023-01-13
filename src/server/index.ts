import debugModule from 'debug';
import path from 'path';
import express from 'express';
import compression from 'compression';
import {handlerDefault} from '../router/handlerDefault';
import {handlerConfig} from '../router/handlerConfig';
import {handlerDebug} from '../router/handlerDebug';

import type * as http from 'http';
import type {configType} from '../config/types';

const debug = debugModule('oracle-health-dashboard:server');

export async function serverStart(config: configType): Promise<{app: express.Express, server: http.Server}> {
	debug('startServer');

	return new Promise(resolve => {
		const app = express();

		// compression
		app.use(compression());

		// "static" route
		const staticDirectory = path.resolve(__dirname, '..');
		debug(`Static directory "${staticDirectory}"`);
		app.use('/static', express.static(staticDirectory));

		// "default" route
		app.get('/', handlerDefault.bind(null, config));

		// "config" route
		app.get('/config', handlerConfig.bind(null, config));

		// "debug" route
		app.get('/debug', handlerDebug.bind(null, config));

		// listen
		const server = app.listen(config.options.http_port, () => {
			resolve({app, server});
		});
	});
}

export async function serverStop(server: http.Server): Promise<void> {
	return new Promise(resolve => server.close(() => {
		resolve();
	}));
}
