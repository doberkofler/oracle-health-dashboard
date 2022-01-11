import debugModule from 'debug';
import {gatherInitialCDB} from './database.js';
import {statsInit} from '../statsStore.js';
import type {configType} from '../config.js';

const debug = debugModule('oracle-health-dashboard:gatherer');


/**
 * Start statistics gathering.
 *
 * @param {databaseConfigType} config - The configuration object.
 * @returns {Promise<void>} - A promise that resolves when done.
 */
export async function gathererInitialize(config: configType): Promise<void> {
	debug('gathererInitialize');

	// intial query all databases and and wait until we got results from all of them
	const queryResults = await Promise.all(config.cdb.map(gatherInitialCDB));

	// initialize the statistics
	const stats = config.cdb.map((cdb, index) => {
		const result = queryResults[index];

		return {
			cdb_name: cdb.name,
			oracle_version: result.oracle_version,
		};
	});

	// initialize statistics
	statsInit(config, stats);
}
