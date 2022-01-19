import debugModule from 'debug';
import {expose} from 'threads/worker';
import {statsAdd} from '../statsStore.js';
import {gatherPeriodic} from './databaseWorker.js';
import {inspect} from '../util/util.js';
import type {configType} from '../config.js';

const debug = debugModule('oracle-health-dashboard:gatherer');

export type Gatherer = typeof gatherer

expose(gatherer);

/**
 * Start statistics gathering.
 *
 * @param {configType} config - The configuration object.
 * @returns {Promise<void>} - A promise that resolves when done.
 */
export async function gatherer(config: configType): Promise<void> {
	debug('gatherer');

	// quere all databases and and wait until we got results from all of them
	const results = await Promise.all(config.databases.filter(e => e.enabled).map(gatherPeriodic));

	// process the results and prepare the statics to add
	const stats = results.map(result => ({
		id: result.id,
		hostName: result.hostName,
		databaseName: result.databaseName,
		schemaName: result.schemaName,
		status: result.status,
		metric: result.metric,
	}));

	debug('gatherer', inspect({results, stats}));

	// add the statistics
	statsAdd(stats);

	// repeat again in "config.pollingSeconds" seconds
	setTimeout(gatherer.bind(null, config), config.pollingSeconds * 1000);
}
