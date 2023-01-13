import debugModule from 'debug';
import {expose} from 'threads/worker';
import {statsAdd} from '../statsStore';
import {gatherPeriodic} from '../database/worker';
import {prettyFormat} from '../util/util';
import {log} from '../util/tty';

import type {configType} from '../config/types';
import type {gatherDatabaseType} from '../database/worker';

const debug = debugModule('oracle-health-dashboard:gatherer');

export type Gatherer = typeof gatherer;

expose(gatherer);

/**
 * Start statistics gathering.
 *
 * @param {configType} config - The configuration object.
 * @returns {Promise<void>} - A promise that resolves when done.
 */
export async function gatherer(config: configType): Promise<void> {
	debug('gatherer');

	log('Gathering metrics...');

	const promises = [] as Promise<gatherDatabaseType>[];

	// process hosts
	config.hosts.filter(host => host.enabled).forEach(host => {
		// container database
		host.databases.filter(database => database.enabled).forEach(database => {
			// gather
			promises.push(gatherPeriodic(config.customSelectRepository, host, database, database.schemas, {
				includePassword: true,
				connectTimeoutSeconds: config.options.connectTimeoutSeconds,
			}));
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
		schemas: result.schemas,
	}));

	debug('gatherer', prettyFormat({results, stats}));

	// add the statistics
	statsAdd(stats);

	// repeat again in "config.pollingSeconds" seconds
	setTimeout(() => {
		void gatherer(config);
	}, config.options.pollingSeconds * 1000);
}
