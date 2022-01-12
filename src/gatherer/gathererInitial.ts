import debugModule from 'debug';
import {gatherInitial} from './databaseInitial.js';
import {statsInitial} from '../statsStore.js';
import type {initialGatherType} from './databaseInitial.js';
import type {configType} from '../config.js';

const debug = debugModule('oracle-health-dashboard:gatherer');

/**
 * Initialize statistics gathering.
 *
 * @param {databaseConfigType} config - The configuration object.
 * @returns {Promise<void>} - A promise that resolves when done.
 */
export async function gathererInitial(config: configType): Promise<void> {
	debug('gathererInitial');

	const queryPromises = [] as Promise<initialGatherType>[];

	config.cdb.forEach(cdb => {
		if (Array.isArray(cdb.pdb)) {
			cdb.pdb.forEach(pdb => {
				queryPromises.push(gatherInitial({
					name: pdb.name,
					connectionString: pdb.connection,
					username: pdb.username,
					password: pdb.password,
				}, cdb.name, pdb.name));
			});
		} else {
			queryPromises.push(gatherInitial({
				name: cdb.name,
				connectionString: cdb.connection,
				username: cdb.username,
				password: cdb.password,
			}, cdb.name, ''));
		}
	});

	const queryResults = await Promise.all(queryPromises);

	const stats = queryResults.map(e => {
		if (!e.statics) {
			throw new Error('Internal error');
		}

		return {
			cdb_name: e.cdb_name,
			pdb_name: e.pdb_name,
			statics: e.statics,
		};
	});

	statsInitial(stats);
}
