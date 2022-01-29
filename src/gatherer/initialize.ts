import debugModule from 'debug';
import oracledb from 'oracledb';
import {connect, disconnect, execute, getPlaceholder} from './oracle.js';
import {getStatus} from './databaseWorker.js';
import {statsInitial} from '../statsStore.js';
import {getConnectionDatabase} from '../config/connection.js';

import type {configType, configHostType, configDatabaseType} from '../config/config.js';
import type {statsKeyType} from '../statsStore.js';
import type {statusType} from './databaseWorker.js';

const debug = debugModule('oracle-health-dashboard:databaseInitial');

export type sqlInitialType = {
	oracle_version: string,
	oracle_platform: string,
	oracle_log_mode: string,
	oracle_database_character_set: string,
	oracle_sga_target: string,
	oracle_pga_aggregate_target: string,
};

export type initialGatherType = statsKeyType & {
	status: statusType,
	statics?: sqlInitialType,
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

	const queryPromises: Promise<initialGatherType>[] = [];
	config.hosts.forEach(host => {
		host.databases.forEach(database => {
			queryPromises.push(gatherInitialize(host, database));
		});
	});

	const queryResults = await Promise.all(queryPromises);

	const stats = queryResults.map(e => {
		return {
			hostName: e.hostName,
			databaseName: e.databaseName,
			statics: e.statics,
		};
	});

	statsInitial(stats);
}

/*
 * get statistics from CDB.
 */
async function gatherInitialize(host: configHostType, database: configDatabaseType): Promise<initialGatherType> {
	const connectionOptions = getConnectionDatabase(host, database);
	const title = `Gathering initial data on host "${host.name}" with database "${database.name}" as "${connectionOptions.username}" using "${connectionOptions.connectionString}"`;

	debug(title);

	const data: initialGatherType = {
		hostName: host.name,
		databaseName: database.name,
		status: getStatus(true),
	};

	// connect
	const connection = await connect(connectionOptions);
	if (typeof connection === 'string') {
		console.log(`${title}: error`);
		data.status = getStatus(false, connection);
		return data;
	}

	// execute
	const info = await execute<sqlInitialType>(connection, sqlInitial, bndInitial);
	if (typeof info === 'string') {
		console.log(`${title}: cannot execute`);
		data.status = getStatus(false, info);
		return data;
	}

	// disconnect
	const result = disconnect(connection, connectionOptions);
	if (typeof result === 'string') {
		console.log(`${title}: cannot disconnect`);
		data.status = getStatus(false, result);
		return data;
	}

	console.log(`${title}: success`);

	data.statics = info;

	return data;
}
