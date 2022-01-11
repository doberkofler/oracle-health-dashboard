import {jsonLoad, jsonSave} from './util/files.js';
import {inspect} from './util/util.js';
import type {configType} from './config';
import type {statusType, metricType} from './gatherer/database.js';

const MAGIC = 'MAGIC';
const VERSION = 1;

// Use JSON file for storage
const FILENAME = 'db.json';

export type statsKeyType = {
	cdb_name: string,
	pdb_name: string,
};

export type statsInitType = {
	cdb_name: string,
	oracle_version: string,
};

export type statsAddDataType = statsKeyType & {
	status: statusType,
	metric: metricType,
};

export type statusMetricType = statusType & metricType;

export type statsDataType = statsKeyType & {
	oracle_version: string,
	metrics: statusMetricType[],
};

export type statsType = {
	magic: string,
	version: number,
	database: statsDataType[],
};

/*
export type cdbStatsExportType = {
	name: string,
	database_version: string,
	values: [
		Date, 			// timestamp
		boolean,		// status
		string,			// message
		Date | null,	// server_date
		number | null,	// number_of_sessions
		number | null,	// host_cpu_utilization
		number | null,	// io_requests_per_second
		number | null,	// buffer_cache_hit_ratio
		number | null,	// executions_per_sec
		number | null,	// flashback_percentage
		Date | null,	// last_successful_rman_backup_date_full_db
		Date | null,	// last_successful_rman_backup_date_archive_log
		Date | null,	// last_rman_backup_date_full_db
		Date | null,	// last_rman_backup_date_archive_log
	],
};

export type statsExportType = {
	magic: string,
	version: number,
	dict: string[],
	data: cdbStatsExportType[],
};
*/

/**
 * Initialize statistics.
 *
 * @param {initialGatherType} data - The stored statistics.
 */
export function statsInit(config: configType, data: statsInitType[]): void {
	const database: statsDataType[] = [];

	config.cdb.forEach(cdb => {
		const f = data.find(e => e.cdb_name === cdb.name);
		if (!f) {
			throw new Error(`Unable to find data bucket with cdb "${cdb.name}"`);
		}

		// are we dealing with a multitenant architecture
		if (Array.isArray(cdb.pdb)) {
			cdb.pdb.forEach(pdb => {
				database.push({
					cdb_name: cdb.name,
					pdb_name: pdb.name,
					oracle_version: f.oracle_version,
					metrics: [],
				});
			});
		} else {
			database.push({
				cdb_name: cdb.name,
				pdb_name: '',
				oracle_version: f.oracle_version,
				metrics: [],
			});
		}
	});

	statsSave(database);
}

/**
 * Load statistics.
 *
 * @return {statsDataType[]} - The stored statistics.
 */
export function statsLoad(): statsDataType[] {
	let stats: statsType;

	try {
		stats = jsonLoad(FILENAME);
	// eslint-disable-next-line no-empty
	} catch (e: unknown) {
		throw new Error(`Statistics database in file "${FILENAME}" not found.`);
	}

	if (stats.magic !== MAGIC) {
		throw new Error(`Statistics database in file "${FILENAME}" is invalid.\n${inspect(stats)}`);
	}

	if (stats.version !== VERSION) {
		throw new Error(`Statistics database in file "${FILENAME}" has version "${stats.version}" instead of "${VERSION}".\n${inspect(stats)}`);
	}

	return stats.database;
}

/**
 * Add statistics.
 *
 * @param {statsDataType[]} newData - The data to store.
 */
export function statsAdd(newData: statsAddDataType[]): void {
	const oldDatabase = statsLoad();

	newData.forEach(e => {
		const database = oldDatabase.find(compareKey.bind(null, e));
		if (!database) {
			throw new Error(`Unable to find database with cdb "${e.cdb_name}" and pdb "${e.pdb_name}" in "${inspect(oldDatabase)}"`);
		}

		const metric = Object.assign({}, e.metric, e.status);
		database.metrics.push(metric);
	});

	statsSave(oldDatabase);
}

/*
 * Save statistics.
 */
function statsSave(database: statsDataType[]): void {
	const stats: statsType = {
		magic: MAGIC,
		version: VERSION,
		database,
	};

	jsonSave(FILENAME, stats);
}

function compareKey(key1: statsKeyType, key2: statsKeyType): boolean {
	return key1.cdb_name === key2.cdb_name && key1.pdb_name === key2.pdb_name;
}

/*
*	Initialize stats
*/
/*
function initStats(): statsType {
	return {
		magic: MAGIC,
		version: VERSION,
		dict: [
			'timestamp',
			'status',
			'message',
			'server_date',
			'number_of_sessions',
			'host_cpu_utilization',
			'io_requests_per_second',
			'buffer_cache_hit_ratio',
			'executions_per_sec',
			'flashback_percentage',
			'last_successful_rman_backup_date_full_db',
			'last_successful_rman_backup_date_archive_log',
			'last_rman_backup_date_full_db',
			'last_rman_backup_date_archive_log',
		],
		data: [],
	};
}
*/
