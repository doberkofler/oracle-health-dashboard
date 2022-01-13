import debugModule from 'debug';
import {gatherInitial} from './databaseInitial.js';
import {statsInitial} from '../statsStore.js';
import type {configType} from '../config.js';

const debug = debugModule('oracle-health-dashboard:gatherer');

/**
 * Initialize statistics gathering.
 *
 * @param {configType} config - The configuration object.
 * @returns {Promise<void>} - A promise that resolves when done.
 */
export async function gathererInitial(config: configType): Promise<void> {
	debug('gathererInitial');

	const queryPromises = config.databases.filter(database => database.enabled).map(gatherInitial);
	const queryResults = await Promise.all(queryPromises);

	const stats = queryResults.map(e => {
		return {
			id: e.id,
			hostName: e.hostName,
			databaseName: e.databaseName,
			schemaName: e.schemaName,
			statics: e.statics,
		};
	});

	statsInitial(stats);
}
