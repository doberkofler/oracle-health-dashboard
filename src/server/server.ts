import debugModule from 'debug';
import path from 'path';
import os from 'os';
import * as portfinder from 'portfinder';
import express from 'express';
import chalk from 'chalk';
import compression from 'compression';
import {handlerData} from './handlerData';
import {handlerDashboard} from './handlerDashboard';
import {handlerGenDoc} from './handlerGenDoc';
import {handlerConfig} from './handlerConfig';
import {handlerDebug} from './handlerDebug';
import {log} from './util/tty';

import type * as http from 'http';
import type {cliOptionsType} from './options';
import type {configType} from '../shared/types';

const debug = debugModule('oracle-health-dashboard:server');
const ifaces = os.networkInterfaces();

export const serverStart = async (options: cliOptionsType, config: configType): Promise<{app: express.Express, server: http.Server}> => {
	debug('startServer');

	// find port
	if (options.port === 0) {
		portfinder.setBasePort(8080);
		options.port = await portfinder.getPortPromise();
	}

	return new Promise(resolve => {
		const app = express();

		// compression
		app.use(compression());

		// "static" route
		const staticDirectory = path.resolve(__dirname, '..');
		debug(`Static directory "${staticDirectory}"`);
		app.use('/static', express.static(staticDirectory));

		// handler
		handlerData(app, config);
		handlerDashboard(app, config);
		handlerGenDoc(app, config);
		handlerConfig(app, config);
		handlerDebug(app, config);

		// listen
		const server = app.listen(options.port, () => {
			resolve({
				app,
				server,
			});
		});
	});
};

export const serverStop = async (server: http.Server): Promise<void> => {
	return new Promise(resolve => server.close(() => {
		resolve();
	}));
};

export const showConnectInfo = (protocol: string, host: string, port: number): void => {
	if (host === '0.0.0.0') {
		Object.keys(ifaces).forEach(dev => {
			const iface = ifaces[dev];
			if (iface) {
				iface.forEach(details => {
					if (details.family === 'IPv4') {
						log(`  ${protocol}://${details.address}:${chalk.green(port.toString())}`);
					}
				});
			}
		});
	} else {
		log(`  ${protocol}://${host}:${chalk.green(port.toString())}`);
	}
};
