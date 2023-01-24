import debugModule from 'debug';
import {spawn, Thread, Worker} from 'threads';
import {configLoad} from './config';
import {installShutdown} from './shutdown';
import {gathererInitial} from './database/initialize';
import {serverStart, serverStop, showConnectInfo} from '../server/server';
import {log} from './util/tty';

import type {cliOptionsType} from './options';
import type {Gatherer} from './gatherer';

const debug = debugModule('oracle-health-dashboard:runserver');

export async function runServer(options: cliOptionsType): Promise<void> {
	debug('runServer', options);

	// install shutdown handler
	installShutdown(shutdownHandler);

	// load configuration
	debug('load configuration');
	const config = configLoad(options.config, options.encryptionKey);

	// initialize gatherer
	debug('initialize gatherer');
	await gathererInitial(config);

	// start gatherer thread
	debug('start gatherer thread');
	const gatherer = await spawn<Gatherer>(new Worker('../server/gatherer'));
	await gatherer(config);

	// start srever
	const {server} = await serverStart(options, config);
	showConnectInfo('http', options.host, options.port);

	async function shutdownHandler(): Promise<void> {
		// terminate gataherer thread
		log('Stopping gatherer thread...');
		await Thread.terminate(gatherer);
		log('Stopped gatherer thread.');

		// close server
		log('Closing server connection...');
		await serverStop(server);
		log('Closed server connections.');
	}
}
