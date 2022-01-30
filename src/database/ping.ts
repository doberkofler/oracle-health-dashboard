import debugModule from 'debug';
import {probe} from '../util/probe.js';
import {getConnectionString, connect, disconnect} from './oracle.js';
import {write, writeNewLine, writeStrtingOnColumn} from '../util/tty.js';

import type {configType} from '../config/config';
import type {connectionOptionsType} from './oracle.js';

const debug = debugModule('oracle-health-dashboard:databasePing');

type pingType = {
	title: string,
	address: string,
	connection: connectionOptionsType,
};

export type pingResultType = {
	totalCount: number,
	successCount: number,
};

/**
 * Ping all connections.
 *
 * @param {configType} config - The configuration object.
 * @returns {Promise<pingResultType>} - A promise that resolves when done.
 */
export async function ping(config: configType): Promise<pingResultType> {
	debug('ping');

	const pings = [] as pingType[];

	// process hosts
	config.hosts.filter(host => host.enabled).forEach(host => {
		// container database
		host.databases.filter(database => database.enabled).forEach(database => {
			if (database.containerDatabase) {
				const connectionString = getConnectionString(host.address, database.containerDatabase.port, database.containerDatabase.service);
				pings.push({
					title:  `Attempting to connect with database "${database.name}" as "${database.containerDatabase.username}" using "${connectionString}"`,
					address: host.address,
					connection: {
						connectionString,
						username: database.containerDatabase.username,
						password: database.containerDatabase.password,
					},
				});
			}

			// single or pluggable database
			const connectionString = getConnectionString(host.address, database.port, database.service);
			pings.push({
				title:  `Attempting to connect with database "${database.name}" as "${database.username}" using "${connectionString}"`,
				address: host.address,
				connection: {
					connectionString,
					username: database.username,
					password: database.password,
				},
			});

			// process schemas
			database.schemas.filter(schema => schema.enabled).forEach(schema => {
				const connectionString = getConnectionString(host.address, database.port, database.service);
				pings.push({
					title:  `Attempting to connect with database "${database.name}" as "${schema.username}" using "${connectionString}"`,
					address: host.address,
					connection: {
						connectionString,
						username: schema.username,
						password: schema.password,
					},
				});
			});
		});
	});

	// process all pings sequencially
	const status = {
		totalCount: pings.length,
		successCount: 0,
	};
	for (let i = 0; i < pings.length; i++) {
		const ping = pings[i];

		write('\n' + ping.title);

		let message = 'success';

		// probe the host
		writeStrtingOnColumn(' - probing ...', ping.title.length);
		const hostAlive = await probe(ping.address);
		if (!hostAlive) {
			message = 'host not alive';
		} else {
			writeStrtingOnColumn(' - connecting ...', ping.title.length);
			const success = await connectionTest(ping.connection);
			if (success) {
				status.successCount++;
			} else {
				message = 'error';
			}
		}

		writeStrtingOnColumn(' - ' + message, ping.title.length);
	}

	writeNewLine();

	return status;
}

/*
*	Connect test
*/
async function connectionTest(options: connectionOptionsType): Promise<boolean> {
	const connection = await connect(options);
	if (typeof connection === 'string') {
		return false;
	}
	
	await disconnect(connection, options);

	return true;
}
