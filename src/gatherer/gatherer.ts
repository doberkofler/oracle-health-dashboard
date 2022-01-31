import debugModule from 'debug';
import {expose} from 'threads/worker';
import {statsAdd} from '../statsStore.js';
import {gatherPeriodic} from '../database/worker.js';
import {getFlat} from '../config/config.js';
import {inspect} from '../util/util.js';

import type {configType} from '../config/config.js';
import type {periodicGatherType} from '../database/worker.js';

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

	console.log('Gathering metrics...');

	const promises = [] as Promise<periodicGatherType>[];

	// process hosts
	config.hosts.filter(host => host.enabled).forEach(host => {
		// container database
		host.databases.filter(database => database.enabled).forEach(database => {
			// gather
			promises.push(gatherPeriodic(getFlat(host, database)));
		});
	});
	// quere all databases and and wait until we got results from all of them
	const results = await Promise.all(promises);

	// process the results and prepare the statics to add
	const stats = results.map(result => ({
		hostName: result.hostName,
		databaseName: result.databaseName,
		schemaName: '',
		status: result.status,
		metric: result.metric,
	}));

	debug('gatherer', inspect({results, stats}));

	// add the statistics
	statsAdd(stats);

	// repeat again in "config.pollingSeconds" seconds
	setTimeout(gatherer.bind(null, config), config.pollingSeconds * 1000);
}
