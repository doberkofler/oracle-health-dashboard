import debugModule from 'debug';
import oracledb from 'oracledb';
import {connect, disconnect, execute, getPlaceholder} from './oracle.js';
import {getStatus} from './database.js';
import type {statsKeyType} from '../statsStore.js';
import type {connectionOptionsType} from './oracle.js';
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
 * get statistics from CDB.
 */
export async function gatherInitial(options: connectionOptionsType, cdb_name: string, pdb_name: string): Promise<initialGatherType> {
	// connect
	const connection = await connect(options);
	if (typeof connection === 'string') {
		return {
			cdb_name,
			pdb_name,
			status: getStatus(false, connection),
		};
	}

	// get information
	debug(`Gather initial database information "${options.name}"`);
	const info = await execute<sqlInitialType>(connection, sqlInitial, bndInitial);
	if (typeof info === 'string') {
		return {
			cdb_name,
			pdb_name,
			status: getStatus(false, info),
		};
	}

	// disconnect from database
	const result = disconnect(options.name, connection);
	if (typeof result === 'string') {
		return {
			cdb_name,
			pdb_name,
			status: getStatus(false, result),
		};
	}

	return {
		cdb_name,
		pdb_name,
		status: getStatus(true),
		statics: info,
	};
}
