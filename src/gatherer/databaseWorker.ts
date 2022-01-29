import debugModule from 'debug';
import oracledb from 'oracledb';
import {getConnectionDatabase, getConnectionContainerDatabase/*, getConnectionSchema*/} from '../config/connection.js';
import {connect, disconnect, execute, getPlaceholder} from './oracle.js';
import {inspect} from '../util/util.js';

import type {statsKeyType} from '../statsStore.js';
import type {configHostType, configDatabaseType/*, configSchemaType*/} from '../config/config.js';

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

export type metricType = sqlCdbType & sqlPdbType;

export type periodicGatherType = statsKeyType & {
	status: statusType,
	metric: metricType,
};

export type periodicGatherSchemaType = statsKeyType & {
	status: statusType,
};

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

/**
 * get statistics from CDB.
 */
export async function gatherPeriodic(host: configHostType, database: configDatabaseType): Promise<periodicGatherType> {
	const data: periodicGatherType = {
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
		},
	};

	const connectDatabase = getConnectionDatabase(host, database);
	const connectContainerDatabase = getConnectionContainerDatabase(host, database);

	// connect with PDB
	const connection = await connect(connectDatabase);
	if (typeof connection === 'string') {
		data.status = getStatus(false, connection);
		return data;
	}

	// get information for PDB
	const infoPDB = await execute<sqlPdbType>(connection, sqlPDB, bindingsPDB);
	if (typeof infoPDB === 'string') {
		disconnect(connection, connectDatabase);
		data.status = getStatus(false, infoPDB);
		return data;
	}
	data.metric.no_of_sessions = infoPDB.no_of_sessions;
	data.metric.flashback_percentage = infoPDB.flashback_percentage;
	data.metric.last_successful_rman_backup_date_full_db = infoPDB.last_successful_rman_backup_date_full_db;
	data.metric.last_successful_rman_backup_date_archive_log = infoPDB.last_successful_rman_backup_date_archive_log;
	data.metric.last_rman_backup_date_full_db = infoPDB.last_rman_backup_date_full_db;
	data.metric.last_rman_backup_date_archive_log = infoPDB.last_rman_backup_date_archive_log;

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
		const connection = await connect(connectContainerDatabase);
		if (typeof connection === 'string') {
			data.status = getStatus(false, connection);
			return data;
		}
	
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

		// disconnect from CDB
		resultCDB = disconnect(connection, connectContainerDatabase);
		if (typeof resultCDB === 'string') {
			data.status = getStatus(false, resultCDB);
			return data;
		}
	}

	/* TODO:
	// eventually also gather information about the schema
	if (schema) {
		const connectSchema = getConnectionSchema(host, database, schema);
		debug({schema, connectSchema});
		const schemaInfo = await gatherSchema(database);
		if (!schemaInfo.status.success) {
			data.status = schemaInfo.status;
			return data;
		}
	}
	*/

	data.status = getStatus(true);

	debug('gatherPeriodic', inspect({database, data}));

	return data;
}

/*
* get statistics from schema.
*/
/* TODO:
async function gatherSchema(database: databaseType): Promise<periodicGatherSchemaType> {
	debug('gatherSchema', database.schemaName);

	const data: periodicGatherSchemaType = {
		id: database.id,
		hostName: database.hostName,
		databaseName: database.databaseName,
		schemaName: database.schemaName,
		status: getStatus(true, ''),
	};

	// connect with schema
	const connection = await connect(database.schemaConnect);
	if (typeof connection === 'string') {
		data.status = getStatus(false, connection);
		return data;
	}

	// disconnect from schema
	const resultDisconnect = disconnect(connection, database.schemaConnect);
	if (typeof resultDisconnect === 'string') {
		data.status = getStatus(false, resultDisconnect);
		return data;
	}

	return data;
}
*/

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
