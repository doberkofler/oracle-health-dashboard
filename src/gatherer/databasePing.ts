import debugModule from 'debug';
import {connect, disconnect} from './oracle.js';
import {isMultitenant} from './databaseWorker.js';

import type {databaseType, configType} from '../config';
import type {connectionOptionsType} from './oracle.js';

const debug = debugModule('oracle-health-dashboard:databasePing');

export type pingStatusType = {
	totalCount: number,
	successCount: number,
};

/**
 * Ping all connections.
 *
 * @param {configType} config - The configuration object.
 * @returns {Promise<pingStatusType>} - A promise that resolves when done.
 */
export async function ping(config: configType): Promise<pingStatusType> {
	debug('ping');

	const queryPromises = config.databases.filter(database => database.enabled).map(doPing);
	const statuses = await Promise.all(queryPromises);

	const status = {
		totalCount: 0,
		successCount: 0,
	};
	statuses.forEach(e => {
		status.totalCount += e.totalCount;
		status.successCount += e.successCount;
	});

	return status;
}

/**
 * Ping a connection.
 */
export async function doPing(database: databaseType): Promise<pingStatusType> {
	let success = false;
	const status = {
		totalCount: 0,
		successCount: 0,
	};

	// are we dealing with a multitenant architecture
	const multitenant = isMultitenant(database);

	// connect with CDB
	if (multitenant) {
		status.totalCount++;
		success = await doConnect(database.hostName, database.databaseName, database.cdbConnect);
		if (success) {
			status.successCount++;
		}
	}

	// connect with PDB
	success = await doConnect(database.hostName, database.databaseName, database.pdbConnect);
	status.totalCount++;
	if (success) {
		status.successCount++;
	}

	// connect with schema
	if (database.schemaName.length > 0) {
		success = await doConnect(database.hostName, database.databaseName, database.schemaConnect);
		status.totalCount++;
		if (success) {
			status.successCount++;
		}
	}

	return status;
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
