import debugModule from 'debug';
import {configLoad} from './config';
import {ping} from './database/ping';
import {installShutdown} from './shutdown';

import type {cliOptionsType} from './options';

const debug = debugModule('oracle-health-dashboard:runping');

export async function runPing(options: cliOptionsType): Promise<void> {
	debug('runPing', options);

	// install shutdown handler
	installShutdown();

	// load configuration
	debug('load configuration');
	const config = configLoad(options.config, options.encryptionKey);

	// ping all databases
	debug('initialize gatherer');
	const status = await ping(config);

	// summary
	console.log(`Total number of pings: ${status.totalCount}. Successful: ${status.successCount}. Failed: ${status.totalCount - status.successCount}.`);
}
