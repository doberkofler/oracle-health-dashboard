import debugModule from 'debug';
import {connect, disconnect} from './oracle.js';
import {isMultitenant} from './databaseWorker.js';

import type {databaseType, configType} from '../config';
import type {connectionOptionsType} from './oracle.js';

const debug = debugModule('oracle-health-dashboard:databasePing');

/**
 * Ping all connections.
 *
 * @param {configType} config - The configuration object.
 * @returns {Promise<void>} - A promise that resolves when done.
 */
export async function ping(config: configType): Promise<void> {
	debug('ping');

	const queryPromises = config.databases.filter(database => database.enabled).map(doPing);
	await Promise.all(queryPromises);
}

/**
 * Ping a connection.
 */
export async function doPing(database: databaseType): Promise<void> {
	// are we dealing with a multitenant architecture
	const multitenant = isMultitenant(database);

	// connect with CDB
	if (multitenant) {
		await doConnect(database.hostName, database.databaseName, database.cdbConnect);
	}

	// connect with PDB
	await doConnect(database.hostName, database.databaseName, database.pdbConnect);

	// connect with schema
	if (database.schemaName.length > 0) {
		await doConnect(database.hostName, database.databaseName, database.schemaConnect);
	}
}

/*
*	Connect test
*/
async function doConnect(hostName: string, databaseName: string, connectOptions: connectionOptionsType): Promise<boolean> {
	const message = `Ping host "${hostName}" with database "${databaseName}" as "${connectOptions.username}" using "${connectOptions.connection}"`;

	const connection = await connect(connectOptions);
	if (typeof connection === 'string') {
		console.log(`${message} - error`);
		return false;
	}
	
	await disconnect(connection, connectOptions);

	console.log(`${message} - success`);

	return true;
}
