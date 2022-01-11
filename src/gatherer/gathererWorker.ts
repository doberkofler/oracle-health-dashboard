import debugModule from 'debug';
import {expose} from 'threads/worker';
import {statsAdd} from '../statsStore.js';
import {gatherPeriodicCDB} from './database.js';
import {inspect} from '../util/util.js';
import type {configType} from '../config.js';

const debug = debugModule('oracle-health-dashboard:gatherer');

export type Gatherer = typeof gatherer

expose(gatherer);

/**
 * Start statistics gathering.
 *
 * @param {databaseConfigType} config - The configuration object.
 * @returns {Promise<void>} - A promise that resolves when done.
 */
export async function gatherer(config: configType): Promise<void> {
	debug('gatherer');

	// quere all databases and and wait until we got results from all of them
	const results = await Promise.all(config.cdb.map(gatherPeriodicCDB));

	// process the results and prepare the statics to add
	const stats = results.map(result => ({
		cdb_name: result.cdb_name,
		pdb_name: result.pdb_name,
		status: result.status,
		metric: result.metric,
	}));

	debug('gatherer', inspect({results, stats}));

	// add the statistics
	statsAdd(stats);

	// repeat again in "config.pollingSeconds" seconds
	setTimeout(gatherer.bind(null, config), config.pollingSeconds * 1000);
}
