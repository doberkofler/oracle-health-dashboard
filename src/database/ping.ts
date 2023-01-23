import debugModule from 'debug';
import {probe} from '../util/probe';
import {connect, disconnect} from './oracle';
import {getConnectionString} from '../config/connection';
import {write, writeNewLine, writeStartingOnColumn} from '../util/tty';

import type {configType} from '../types';
import type {connectionOptionsType} from '../config/connection';

const debug = debugModule('oracle-health-dashboard:databasePing');

type pingType = {
	title: string,
	address: string,
	probe: boolean,
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
				const connectionString = getConnectionString(host.address, database.containerDatabase.port, database.containerDatabase.service, config.options.connectTimeoutSeconds);
				pings.push({
					title:  `Attempting to connect with database "${database.name}" as "${database.containerDatabase.username}" using "${connectionString}"`,
					address: host.address,
					probe: host.probe,
					connection: {
						connectionString,
						username: database.containerDatabase.username,
						password: database.containerDatabase.password,
					},
				});
			}

			// single or pluggable database
			const connectionString = getConnectionString(host.address, database.port, database.service, config.options.connectTimeoutSeconds);
			pings.push({
				title:  `Attempting to connect with database "${database.name}" as "${database.username}" using "${connectionString}"`,
				address: host.address,
				probe: host.probe,
				connection: {
					connectionString,
					username: database.username,
					password: database.password,
				},
			});

			// process schemas
			database.schemas.filter(schema => schema.enabled).forEach(schema => {
				const schemaConnectionString = getConnectionString(host.address, database.port, database.service, config.options.connectTimeoutSeconds);
				pings.push({
					title:  `Attempting to connect with database "${database.name}" as "${schema.username}" using "${schemaConnectionString}"`,
					address: host.address,
					probe: host.probe,
					connection: {
						connectionString: schemaConnectionString,
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
	for (const p of pings) {
		write(`\n${p.title}`);

		let message = 'success';

		// probe the host
		let hostAlive = true;
		if (p.probe) {
			writeStartingOnColumn(' - probing ...', p.title.length);
			hostAlive = await probe(p.address);
			if (!hostAlive) {
				message = 'host not alive';
			}
		}

		if (hostAlive) {
			writeStartingOnColumn(' - connecting ...', p.title.length);
			const success = await connectionTest(p.connection);
			if (success) {
				status.successCount++;
			} else {
				message = 'error';
			}
		}

		writeStartingOnColumn(` - ${message}`, p.title.length);
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
