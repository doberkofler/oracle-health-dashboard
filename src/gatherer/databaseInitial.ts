import debugModule from 'debug';
import oracledb from 'oracledb';
import {connect, disconnect, execute, getPlaceholder} from './oracle.js';
import {getStatus} from './database.js';
import type {databaseKeyType, databaseType} from '../config';
import type {statusType} from './database.js';

const debug = debugModule('oracle-health-dashboard:databaseInitial');

export type sqlInitialType = {
	oracle_version: string,
	oracle_platform: string,
	oracle_log_mode: string,
	oracle_database_character_set: string,
	oracle_sga_target: string,
	oracle_pga_aggregate_target: string,
};

export type initialGatherType = databaseKeyType & {
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
 * get statistics from CDB.
 */
export async function gatherInitial(database: databaseType): Promise<initialGatherType> {
	const title = `Gathering initial data on host "${database.hostName}" with database "${database.databaseName}" as "${database.cdbConnect.username}" using "${database.cdbConnect.connection}"`;

	debug(title);

	const data: initialGatherType = {
		id: database.id,
		hostName: database.hostName,
		databaseName: database.databaseName,
		//schemaName: database.schemaName,
		status: getStatus(true),
	};

	// connect
	const connection = await connect(database.cdbConnect);
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
	const result = disconnect(connection, database.cdbConnect);
	if (typeof result === 'string') {
		console.log(`${title}: cannot disconnect`);
		data.status = getStatus(false, result);
		return data;
	}

	console.log(`${title}: success`);

	data.statics = info;

	return data;
}
