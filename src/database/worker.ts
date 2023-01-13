import debugModule from 'debug';
import oracledb from 'oracledb';
import {getConnectionDatabase, getConnectionContainerDatabase, getConnectionSchema} from '../config/connection';
import {connect, disconnect, execute, getPlaceholder} from './oracle';
import {getFlat} from '../config/flatten';
import {prettyFormat} from '../util/util';
import {warn} from '../util/tty';

import type {justHostType, justDatabaseType, configSchemaType, configCustomStatType, configCustomRepository} from '../config/types';
import type {connectionFlagsType} from '../config/connection';

const debug = debugModule('oracle-health-dashboard:databaseWorker');

type sqlCdbType = {
	server_date: Date | null,
	host_cpu_utilization: number | null,
	io_requests_per_second: number | null,
	buffer_cache_hit_ratio: number | null,
	executions_per_sec: number | null,
};

type sqlPdbType = {
	no_of_sessions: number | null,
	flashback_percentage: number | null,
	last_successful_rman_backup_date_full_db: Date | null,
	last_successful_rman_backup_date_archive_log: Date | null,
	last_rman_backup_date_full_db: Date | null,
	last_rman_backup_date_archive_log: Date | null,
};

export type statusType = {
	timestamp: Date,
	success: boolean,
	message: string,
};

export type initialGatherType = {
	status: statusType,
	oracle_version: string,
};

export type metricType = sqlCdbType & sqlPdbType & {
	custom: customStatsType,
};

export type gatherSchemaType = {
	name: string,
	status: statusType,
	custom: customStatsType,
};

export type gatherDatabaseType = {
	hostName: string,
	databaseName: string,
	status: statusType,
	metric: metricType,
	schemas: gatherSchemaType[],
};

export type customStatType = {
	title: string,
	value: string,
};
export type customStatsType = customStatType[];

const bndCDB = [
	{
		id: 'server_date',
		type: oracledb.DATE,
	},
	{
		id: 'host_cpu_utilization',
		type: oracledb.NUMBER,
	},
	{
		id: 'io_requests_per_second',
		type: oracledb.NUMBER,
	},
	{
		id: 'buffer_cache_hit_ratio',
		type: oracledb.NUMBER,
	},
	{
		id: 'executions_per_sec',
		type: oracledb.NUMBER,
	},
];

const sqlCDB = `
BEGIN
	-- server date
	SELECT SYSDATE INTO :${getPlaceholder('server_date', bndCDB)} FROM DUAL;

	-- Host CPU Utilization (%)
	SELECT ROUND(MAX(value), 2) INTO :${getPlaceholder('host_cpu_utilization', bndCDB)} FROM v$sysmetric WHERE metric_id = 2057;

	-- I/O Requests per Second
	SELECT ROUND(MAX(value), 2) INTO :${getPlaceholder('io_requests_per_second', bndCDB)} FROM v$sysmetric WHERE metric_id = 2146;

	-- Buffer Cache Hit Ratio
	SELECT ROUND(MIN(value), 2) INTO :${getPlaceholder('buffer_cache_hit_ratio', bndCDB)} FROM v$sysmetric WHERE metric_id = 2000;

	-- Executions Per Sec
	SELECT ROUND(MAX(value), 2) INTO :${getPlaceholder('executions_per_sec', bndCDB)} FROM v$sysmetric WHERE metric_id = 2121;
END;
`;

const bindingsPDB = [
	{
		id: 'no_of_sessions',
		type: oracledb.NUMBER,
	},
	{
		id: 'flashback_percentage',
		type: oracledb.NUMBER,
	},
	{
		id: 'last_successful_rman_backup_date_full_db',
		type: oracledb.DATE,
	},
	{
		id: 'last_successful_rman_backup_date_archive_log',
		type: oracledb.DATE,
	},
	{
		id: 'last_rman_backup_date_full_db',
		type: oracledb.DATE,
	},
	{
		id: 'last_rman_backup_date_archive_log',
		type: oracledb.DATE,
	},
];
const sqlPDB = `
BEGIN
	-- usage
	SELECT COUNT(*) INTO :${getPlaceholder('no_of_sessions', bindingsPDB)} FROM v$session WHERE username IS NOT NULL;
	SELECT SUM(percent_space_used) INTO :${getPlaceholder('flashback_percentage', bindingsPDB)} FROM v$flash_recovery_area_usage;

	-- rman backup
	BEGIN
		SELECT end_time INTO :${getPlaceholder('last_successful_rman_backup_date_full_db', bindingsPDB)} FROM v$rman_backup_job_details b1 WHERE b1.session_stamp = (SELECT MAX(b2.session_stamp) FROM v$rman_backup_job_details b2 WHERE input_type = 'DB FULL' AND b2.status = 'COMPLETED');
	EXCEPTION WHEN NO_DATA_FOUND THEN NULL;
	END;
	BEGIN
		SELECT end_time INTO :${getPlaceholder('last_successful_rman_backup_date_archive_log', bindingsPDB)} FROM v$rman_backup_job_details b1 WHERE b1.session_stamp = (SELECT MAX(b2.session_stamp) FROM v$rman_backup_job_details b2 WHERE input_type = 'ARCHIVELOG' AND b2.status = 'COMPLETED');
	EXCEPTION WHEN NO_DATA_FOUND THEN NULL;
	END;
	BEGIN
		SELECT end_time INTO :${getPlaceholder('last_rman_backup_date_full_db', bindingsPDB)} FROM v$rman_backup_job_details b1 WHERE b1.session_stamp = (SELECT MAX(b2.session_stamp) FROM v$rman_backup_job_details b2 WHERE input_type = 'DB FULL');
	EXCEPTION WHEN NO_DATA_FOUND THEN NULL;
	END;
	BEGIN
		SELECT end_time INTO :${getPlaceholder('last_rman_backup_date_archive_log', bindingsPDB)} FROM v$rman_backup_job_details b1 WHERE b1.session_stamp = (SELECT MAX(b2.session_stamp) FROM v$rman_backup_job_details b2 WHERE input_type = 'ARCHIVELOG');
	EXCEPTION WHEN NO_DATA_FOUND THEN NULL;
	END;
END;
`;

/**
 * get statistics from CDB.
 */
export async function gatherPeriodic(customRepository: configCustomRepository, host: justHostType, database: justDatabaseType, schemas: configSchemaType[], connectionFlags: connectionFlagsType): Promise<gatherDatabaseType> {
	const flat = getFlat(host, database);
	const data: gatherDatabaseType = {
		hostName: host.name,
		databaseName: database.name,
		status: getStatus(false),
		metric: {
			server_date: null,
			host_cpu_utilization: null,
			io_requests_per_second: null,
			buffer_cache_hit_ratio: null,
			executions_per_sec: null,
			no_of_sessions: null,
			flashback_percentage: null,
			last_successful_rman_backup_date_full_db: null,
			last_successful_rman_backup_date_archive_log: null,
			last_rman_backup_date_full_db: null,
			last_rman_backup_date_archive_log: null,
			custom: [],
		},
		schemas: [],
	};

	const connectDatabase = getConnectionDatabase(flat, connectionFlags);
	const connectContainerDatabase = getConnectionContainerDatabase(flat, connectionFlags);

	// connect with PDB
	const connection = await connect(connectDatabase);
	if (typeof connection === 'string') {
		data.status = getStatus(false, connection);
		return data;
	}

	// get information for PDB
	const infoPDB = await execute<sqlPdbType>(connection, sqlPDB, bindingsPDB);
	if (typeof infoPDB === 'string') {
		await disconnect(connection, connectDatabase);
		data.status = getStatus(false, infoPDB);
		return data;
	}
	data.metric.no_of_sessions = infoPDB.no_of_sessions;
	data.metric.flashback_percentage = infoPDB.flashback_percentage;
	data.metric.last_successful_rman_backup_date_full_db = infoPDB.last_successful_rman_backup_date_full_db;
	data.metric.last_successful_rman_backup_date_archive_log = infoPDB.last_successful_rman_backup_date_archive_log;
	data.metric.last_rman_backup_date_full_db = infoPDB.last_rman_backup_date_full_db;
	data.metric.last_rman_backup_date_archive_log = infoPDB.last_rman_backup_date_archive_log;

	// gather custom statistics
	if (database.customSelect.length > 0) {
		data.metric.custom = await getCustomStats(connection, customRepository, database.customSelect);
	}

	if (!connectContainerDatabase) {
		// get information for CDB
		const infoCDB = await execute<sqlCdbType>(connection, sqlCDB, bndCDB);
		if (typeof infoCDB === 'string') {
			data.status = getStatus(false, infoCDB);
			return data;
		}

		data.metric.server_date = infoCDB.server_date;
		data.metric.host_cpu_utilization = infoCDB.host_cpu_utilization;
		data.metric.io_requests_per_second = infoCDB.io_requests_per_second;
		data.metric.buffer_cache_hit_ratio = infoCDB.buffer_cache_hit_ratio;
		data.metric.executions_per_sec = infoCDB.executions_per_sec;
	}

	// disconnect from PDB
	let resultCDB = disconnect(connection, connectDatabase);
	if (typeof resultCDB === 'string') {
		data.status = getStatus(false, resultCDB);
		return data;
	}

	if (connectContainerDatabase) {
		// connect to CDB
		const containerConnection = await connect(connectContainerDatabase);
		if (typeof containerConnection === 'string') {
			data.status = getStatus(false, containerConnection);
			return data;
		}
	
		// get information for CDB
		const infoCDB = await execute<sqlCdbType>(containerConnection, sqlCDB, bndCDB);
		if (typeof infoCDB === 'string') {
			data.status = getStatus(false, infoCDB);
			return data;
		}

		data.metric.server_date = infoCDB.server_date;
		data.metric.host_cpu_utilization = infoCDB.host_cpu_utilization;
		data.metric.io_requests_per_second = infoCDB.io_requests_per_second;
		data.metric.buffer_cache_hit_ratio = infoCDB.buffer_cache_hit_ratio;
		data.metric.executions_per_sec = infoCDB.executions_per_sec;

		// disconnect from CDB
		resultCDB = disconnect(containerConnection, connectContainerDatabase);
		if (typeof resultCDB === 'string') {
			data.status = getStatus(false, resultCDB);
			return data;
		}
	}

	data.status = getStatus(true);

	// gather information about the schemas
	for (const schema of schemas) {
		const resultSchema = await gatherSchema(customRepository, host, database, schema, connectionFlags);
		data.schemas.push(resultSchema);
	}

	debug('gatherPeriodic', prettyFormat(flat));

	return data;
}

/*
* get statistics from schema.
*/
async function gatherSchema(customRepository: configCustomRepository, host: justHostType, database: justDatabaseType, schema: configSchemaType, connectionFlags: connectionFlagsType): Promise<gatherSchemaType> {
	debug('gatherSchema', schema.name);

	const flat = getFlat(host, database, schema);
	const schemaConnect = getConnectionSchema(flat, connectionFlags);

	const data: gatherSchemaType = {
		name: schema.name,
		status: getStatus(true),
		custom: [],
	};

	// connect with schema
	const connection = await connect(schemaConnect);
	if (typeof connection === 'string') {
		data.status = getStatus(false, connection);
		return data;
	}

	// gather custom statistics
	if (schema.customSelect.length > 0) {
		data.custom = await getCustomStats(connection, customRepository, schema.customSelect);
	}

	// disconnect from schema
	const resultDisconnect = disconnect(connection, schemaConnect);
	if (typeof resultDisconnect === 'string') {
		data.status = getStatus(false, resultDisconnect);
		return data;
	}

	return data;
}

/*
* get custom statistics
*/
async function getCustomStats(connection: oracledb.Connection, customRepository: configCustomRepository, key: string): Promise<customStatsType> {
	debug('getCustomStats');

	const custom = customRepository[key];
	if (typeof custom !== 'object') {
		throw new Error(`Unable to find custom repository "${key}" in "${prettyFormat(customRepository)}"`);
	}

	const stats: customStatsType = [];
	for (const e of custom) {
		const stat = await getCustomStat(connection, e);
		if (stat !== null) {
			stats.push(stat);
		}
	}

	return stats;
}

/*
* get custom statistics
*/
async function getCustomStat(connection: oracledb.Connection, custom: configCustomStatType): Promise<customStatType | null> {
	debug('getCustomStat');

	// make sure we have a select statement
	let info: oracledb.StatementInfo | null = null;
	try {
		info = await connection.getStatementInfo(custom.sql);
	} catch (e: unknown) {
		const error = `Cannot process "getStatementInfo" on the select "${custom.sql}".\n${prettyFormat(e)}`;
		warn(error);
		return null;
	}
	if (info.statementType !== oracledb.STMT_TYPE_SELECT) {
		const error = `The custom select "${custom.sql}" is actually not a seect statement`;
		warn(error);
		return null;
	}

	// execute the select
	let result;
	try {
		result = await connection.execute<string[]>(custom.sql);
	} catch (e: unknown) {
		const error = `The custom select "${custom.sql}" has errors.\n${prettyFormat(e)}`;
		warn(error);
		return null;
	}

	// rows
	if (!Array.isArray(result.rows) || result.rows.length < 1) {
		const error = `The custom select "${custom.sql}" did not return any rows.\n${prettyFormat(result)}`;
		warn(error);
		return null;
	}
	if (result.rows.length > 1) {
		warn(`The custom select "${custom.sql}" returned "${result.rows.length}" rows, but only the first one will be used`);
	}
	const row = result.rows[0];

	// columns
	if (!Array.isArray(row) || row.length < 1) {
		const error = `The custom select "${custom.sql}" did not return any columns.\n${prettyFormat(result)}`;
		warn(error);
		return null;
	}
	if (row.length > 1) {
		warn(`The custom select "${custom.sql}" returned "${row.length}" columns, but only the first one will be used`);
	}
	const col = row[0];

	return {
		title: custom.title,
		value: col.toString(),
	};
}

/**
 * get status object.
 */
export function getStatus(success: boolean, message = ''): statusType {
	return {
		timestamp: new Date(),
		success,
		message,
	};
}

/*

Oracle - Tablespace Usage
		SELECT		ddf.TABLESPACE_NAME "Tablespace",
					ddf.BYTES "Bytes Allocated",
					ddf.BYTES - DFS.BYTES  "Bytes Used",
					ROUND(((ddf.BYTES - dfs.BYTES) / ddf.BYTES) * 100, 2) "Percent Used",
         			dfs.BYTES "Bytes Free",
         			ROUND((1 - ((ddf.BYTES - dfs.BYTES) / ddf.BYTES)) * 100, 2) "Percent Free",
         			DECODE(SIGN(ROUND((1 - ((ddf.BYTES - dfs.BYTES) / ddf.BYTES)) * 100, 2) - 10), -1, STYLE_WARNING, NULL) "style"
		FROM    	(	SELECT		TABLESPACE_NAME,
        							SUM(BYTES) bytes
         				FROM		dba_data_files
         				GROUP BY 	TABLESPACE_NAME
  					) ddf,
        			(
        				SELECT		TABLESPACE_NAME,
                					SUM(BYTES) bytes
         				FROM		dba_free_space
         				GROUP BY	TABLESPACE_NAME
         			) dfs
		WHERE		ddf.TABLESPACE_NAME = dfs.TABLESPACE_NAME
		ORDER BY	((ddf.BYTES - dfs.BYTES) / ddf.BYTES) DESC;
*/

