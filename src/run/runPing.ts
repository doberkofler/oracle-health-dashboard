import debugModule from 'debug';
import {configLoad} from '../config/config.js';
import {ping} from '../database/ping.js';
import {installShutdown} from '../shutdown.js';

const debug = debugModule('oracle-health-dashboard:runping');

export async function runPing(configFilename: string, encryptionKey: string): Promise<void> {
	debug('runPing', configFilename, encryptionKey);

	// install shutdown handler
	installShutdown();

	// load configuration
	debug('load configuration');
	const config = configLoad(configFilename, encryptionKey);

	// ping all databases
	debug('initialize gatherer');
	const status = await ping(config);

	// summary
	console.log(`Total number of pings: ${status.totalCount}. Successful: ${status.successCount}. Failed: ${status.totalCount - status.successCount}.`);
}
