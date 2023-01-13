import debugModule from 'debug';
import {spawn, Thread, Worker} from 'threads';
import {configLoad} from '../config/config';
import {installShutdown} from '../shutdown';
import {gathererInitial} from '../database/initialize';
import {serverStart, serverStop} from '../server/index';
import {log} from '../util/tty';


import type {Gatherer} from '../gatherer/gatherer';

const debug = debugModule('oracle-health-dashboard:runserver');

export async function runServer(configFilename: string, encryptionKey: string): Promise<void> {
	debug('runServer', configFilename, encryptionKey);

	// install shutdown handler
	installShutdown(shutdownHandler);

	// load configuration
	debug('load configuration');
	const config = configLoad(configFilename, encryptionKey);

	// initialize gatherer
	debug('initialize gatherer');
	await gathererInitial(config);

	// start gatherer thread
	debug('start gatherer thread');
	const gatherer = await spawn<Gatherer>(new Worker('../server/gatherer'));
	await gatherer(config);

	// start srever
	const {server} = await serverStart(config);
	log(`Listening at http://127.0.0.1:${config.options.http_port}`);

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
