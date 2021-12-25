import debugModule from 'debug';
import {inspect} from 'util';
import oracledb from 'oracledb';
import type {databaseConfigType} from './config.js';
import type {statsDataType, statsMetricsType} from './statsStore.js';

const debug = new debugModule('oracle-health-dashboard:database');

type dataType = {
	name: string,
	data: statsDataType,
};

const bindings = [
	{
		id: 'server_date',
		type: oracledb.DATE,
	},
	{
		id: 'version',
		type: oracledb.STRING,
	},
	{
		id: 'no_of_sessions',
		type: oracledb.NUMBER,
	},
	{
		id: 'percent_space_used',
		type: oracledb.NUMBER,
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
const getPlaceholder = (id: string) => {
	const index = bindings.findIndex(e => e.id === id);
	if (index === -1) {
		throw new Error(`No placeholder "${id}" found`);
	}

	return `p${index + 1}`;
};
const sqlStatement = `
BEGIN
	-- general
	SELECT SYSDATE INTO :${getPlaceholder('server_date')} FROM DUAL;
	SELECT banner INTO :${getPlaceholder('version')} FROM v$version;

	-- usage
	SELECT COUNT(*) INTO :${getPlaceholder('no_of_sessions')} FROM v$sessions WHERE username IS NOT NULL;
	SELECT SUM(percent_space_used) INTO :${getPlaceholder('percent_space_used')} FROM v$flash_recovery_area_usage;

	-- usage
	SELECT SUM(value) INTO :${getPlaceholder('host_cpu_utilization')} FROM v$sysmetric WHERE metric_name = 'host cpu utilization (%)';
	SELECT SUM(value) INTO :${getPlaceholder('io_requests_per_second')} FROM v$sysmetric WHERE metric_name = 'i/o requests per second';
	SELECT SUM(value) INTO :${getPlaceholder('buffer_cache_hit_ratio')} FROM v$sysmetric WHERE metric_name = 'buffer cache hit ratio';
	SELECT SUM(value) INTO :${getPlaceholder('executions_per_sec')} FROM v$sysmetric WHERE metric_name = 'executions per sec';

	-- rman backup
	BEGIN
		SELECT end_time INTO :${getPlaceholder('last_successful_rman_backup_date_full_db')} FROM v$rman_backup_job_details b1 WHERE b1.session_stamp = (SELECT MAX(b2.session_stamp) FROM v$rman_backup_job_details b2 WHERE input_type = 'DB FULL' AND b2.status = 'COMPLETED');
	EXCEPTION WHEN NO_DATA_FOUND THEN NULL;
	END;
	BEGIN
		SELECT end_time INTO :${getPlaceholder('last_successful_rman_backup_date_archive_log')} FROM v$rman_backup_job_details b1 WHERE b1.session_stamp = (SELECT MAX(b2.session_stamp) FROM v$rman_backup_job_details b2 WHERE input_type = 'ARCHIVELOG' AND b2.status = 'COMPLETED');
	EXCEPTION WHEN NO_DATA_FOUND THEN NULL;
	END;
	BEGIN
		SELECT end_time INTO :${getPlaceholder('last_rman_backup_date_full_db')} FROM v$rman_backup_job_details b1 WHERE b1.session_stamp = (SELECT MAX(b2.session_stamp) FROM v$rman_backup_job_details b2 WHERE input_type = 'DB FULL');
	EXCEPTION WHEN NO_DATA_FOUND THEN NULL;
	END;
	BEGIN
		SELECT end_time INTO :${getPlaceholder('last_rman_backup_date_archive_log')} FROM v$rman_backup_job_details b1 WHERE b1.session_stamp = (SELECT MAX(b2.session_stamp) FROM v$rman_backup_job_details b2 WHERE input_type = 'ARCHIVELOG');
	EXCEPTION WHEN NO_DATA_FOUND THEN NULL;
	END;
END;
`;

/**
 * get statistics from database.
 */
export async function gatherDatabase(database: databaseConfigType): Promise<dataType> {
	const data: dataType = {
		name: database.name,
		data: {
			startDate: new Date(),
			endDate: null,
			success: false,
			message: '',
			metrics: {
				version: null,
				server_date: null,
				number_of_sessions: null,
				host_cpu_utilization: null,
				io_requests_per_second: null,
				buffer_cache_hit_ratio: null,
				executions_per_sec: null,
				flashback_percentage: null,
				last_successful_rman_backup_date_full_db: null,
				last_successful_rman_backup_date_archive_log: null,
				last_rman_backup_date_full_db: null,
				last_rman_backup_date_archive_log: null,
			},
		},
	};

	// connect with database
	debug(`Connect with database "${database.name}" as "${database.username}" at "${database.connection}"`);
	const connectionAttributes: oracledb.ConnectionAttributes = {
		connectionString: database.connection,
		user: database.username,
		password: database.password,
	};
	if (database.username.toLowerCase() === 'sys') {
		connectionAttributes.privilege = oracledb.SYSDBA;
	}
	let connection;
	try {
		connection = await oracledb.getConnection(connectionAttributes);
	} catch (e: unknown) {
		const message = `Unable to connect with database "${database.name}" as "${database.username}" at "${database.connection}"`;
		console.error(message, e);
		data.data.message = message + '\n' + (e as Error).message;
		return data;
	}

	// get database metrics
	debug(`Gather database metrics from database "${database.name}" as "${database.username}" at "${database.connection}"`);
	try {
		await gatherDatabaseMetrics(connection, data.data);
	} catch (e: unknown) {
		const message = `Unable to get metrics with database "${database.name}" as "${database.username}" at "${database.connection}"`;
		console.error(message, e);
		data.data.message = message + '\n' + (e as Error).message;
		return data;
	}

	// disconnect from database
	debug(`Disconnect from database "${database.name}" as "${database.username}" at "${database.connection}"`);
	try {
		connection.close();
	} catch (e: unknown) {
		const message = `Unable to disconnect from database "${database.name}" as "${database.username}" at "${database.connection}"`;
		console.error(message, e);
		data.data.message = message + '\n' + (e as Error).message;
		return data;
	}

	data.data.success = true;
	data.data.endDate = new Date();

	return data;
}

/*
*	get database metrics
*/
async function gatherDatabaseMetrics(connection: oracledb.Connection, data: statsDataType): Promise<void> {
	// convert bindings object to the binding objected needed for oracledb
	const binds = {};
	bindings.forEach(binding => {
		binds[getPlaceholder(binding.id)] = {
			type: binding.type,
			dir: oracledb.BIND_OUT,
		};
	});

	// execute pl/sql block and return values
	const result = await connection.execute(sqlStatement, binds);

	// get the results
	data.metrics = {} as unknown as statsMetricsType;
	bindings.forEach(binding => {
		const id = binding.id;
		const placeholder = getPlaceholder(id);

		switch (binding.type) {
		case oracledb.STRING:
			data.metrics[id] = getBindString(result, placeholder);
			break;

		case oracledb.NUMBER:
			data.metrics[id] = getBindNumber(result, placeholder);
			break;

		case oracledb.DATE:
			data.metrics[id] = getBindDate(result, placeholder);
			break;

		default:
			throw new Error(`Invalid bind type "${binding.type}" found for placeholder "${placeholder}"`);
		}
	});
}

/*
*	get string from outBind
*/
function getBindString(result: oracledb.Result<unknown>, placeholder: string): string | null {
	if (result.outBinds[placeholder] === null || typeof result.outBinds[placeholder] === 'string') {
		return result.outBinds[placeholder];
	} else {
		throw new Error(`The result object does not contain a property "${placeholder}" of type "string"\n${inspect(result)}`);
	}
}

/*
*	get number from outBind
*/
function getBindNumber(result: oracledb.Result<unknown>, placeholder: string): number | null {
	if (result.outBinds[placeholder] === null || typeof result.outBinds[placeholder] === 'number') {
		return result.outBinds[placeholder];
	} else {
		throw new Error(`The result object does not contain a property "${placeholder}" of type "number"\n${inspect(result)}`);
	}
}

/*
*	get date from outBind
*/
function getBindDate(result: oracledb.Result<unknown>, placeholder: string): Date | null {
	if (result.outBinds[placeholder] === null) {
		return null;
	} else {
		return new Date(result.outBinds[placeholder]);
	}
}
