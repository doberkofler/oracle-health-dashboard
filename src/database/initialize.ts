import debugModule from 'debug';
import oracledb from 'oracledb';
import {probe} from '../util/probe.js';
import {connect, disconnect, execute, getPlaceholder} from './oracle.js';
import {getStatus} from './worker.js';
import {statsInitial} from '../statsStore.js';
import {getConnectionDatabase} from '../config/connection.js';
import {getFlat} from '../config/flatten.js';
import {write, writeNewLine, writeStartingOnColumn} from '../util/tty.js';

import type {configType, flatType} from '../config/types.js';
import type {statsInitType} from '../statsStore.js';
import type {statusType} from './worker.js';
import type {connectionFlagsType} from '../config/connection.js';

const debug = debugModule('oracle-health-dashboard:databaseInitial');

export type staticMetricType = {
	oracle_version: string,
	oracle_platform: string,
	oracle_log_mode: string,
	oracle_database_character_set: string,
	oracle_sga_target: string,
	oracle_pga_aggregate_target: string,
};

export type initialGatherType = statsInitType & {
	status: statusType,
};

const bndInitial = [
	{
		id: 'oracle_version',
		type: oracledb.STRING,
	},
	{
		id: 'oracle_platform',
		type: oracledb.STRING,
	},
	{
		id: 'oracle_log_mode',
		type: oracledb.STRING,
	},
	{
		id: 'oracle_database_character_set',
		type: oracledb.STRING,
	},
	{
		id: 'oracle_sga_target',
		type: oracledb.STRING,
	},
	{
		id: 'oracle_pga_aggregate_target',
		type: oracledb.STRING,
	},
];

const sqlInitial = `
BEGIN
	-- oracle version
	SELECT version INTO :${getPlaceholder('oracle_version', bndInitial)} FROM v$instance;

	-- oracle platform
	:${getPlaceholder('oracle_platform', bndInitial)} := dbms_utility.port_string();

	-- oracle archive logging active
	SELECT log_mode INTO :${getPlaceholder('oracle_log_mode', bndInitial)} FROM v$database;

	-- oracle database character set
	SELECT value INTO :${getPlaceholder('oracle_database_character_set', bndInitial)} FROM nls_database_parameters WHERE parameter = 'NLS_CHARACTERSET';

	-- oracle sga_target
	SELECT  value INTO :${getPlaceholder('oracle_sga_target', bndInitial)} FROM v$parameter WHERE name = 'sga_target';

	-- oracle pga_aggregate_target
	SELECT  value INTO :${getPlaceholder('oracle_pga_aggregate_target', bndInitial)} FROM v$parameter WHERE name = 'pga_aggregate_target';
END;`;

/**
 * Initialize statistics gathering.
 *
 * @param {configType} config - The configuration object.
 * @returns {Promise<void>} - A promise that resolves when done.
 */
export async function gathererInitial(config: configType): Promise<void> {
	debug('gathererInitial', config);

	// prepare promises
	const gather = [] as flatType[];
	config.hosts.forEach(host => {
		host.databases.forEach(database => {
			gather.push(getFlat(host, database));
		});
	});

	// process promises
	const stats  = [] as statsInitType[];
	for (const g of gather) {
		const result = await gatherInitialize(g, {
			includePassword: true,
			connectTimeoutSeconds: config.options.connectTimeoutSeconds,
		});
		stats.push(result);
	}

	writeNewLine();

	statsInitial(stats);
}

/*
 * get statistics for database
 */
async function gatherInitialize(flat: flatType, connectionFlags: connectionFlagsType): Promise<initialGatherType> {
	const connectionOptions = getConnectionDatabase(flat, connectionFlags);
	const title = `[${new Date().toJSON()}] Gathering initial data with database "${flat.database.name}" as "${connectionOptions.username}" using "${connectionOptions.connectionString}"`;

	write(`\n${title}`);

	const data: initialGatherType = {
		hostName: flat.host.name,
		databaseName: flat.database.name,
		schemaName: '',
		status: getStatus(true),
		statics: {
			oracle_version: '',
			oracle_platform: '',
			oracle_log_mode: '',
			oracle_database_character_set: '',
			oracle_sga_target: '',
			oracle_pga_aggregate_target: '',
		}
	};

	// probe the host
	if (flat.host.probe) {
		writeStartingOnColumn(' - probing ...', title.length);
		const hostAlive = await probe(flat.host.address);
		if (!hostAlive) {
			const message = 'host not alive';
			writeStartingOnColumn(` - ${message}`, title.length);
			data.status = getStatus(false, message);
			return data;
		}
	}

	// connect
	writeStartingOnColumn(' - connecting ...', title.length);
	const connection = await connect(connectionOptions);
	if (typeof connection === 'string') {
		writeStartingOnColumn(' - error', title.length);
		data.status = getStatus(false, connection);
		return data;
	}

	// execute
	const info = await execute<staticMetricType>(connection, sqlInitial, bndInitial);
	if (typeof info === 'string') {
		writeStartingOnColumn(' - cannot execute', title.length);
		data.status = getStatus(false, info);
		return data;
	}

	// disconnect
	const result = disconnect(connection, connectionOptions);
	if (typeof result === 'string') {
		writeStartingOnColumn(' - cannot disconnect', title.length);
		data.status = getStatus(false, result);
		return data;
	}

	writeStartingOnColumn(' - success', title.length);

	data.statics = info;

	return data;
}
