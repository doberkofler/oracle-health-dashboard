import {jsonLoad, jsonSave} from './files.js';

const MAGIC = 'MAGIC';
const VERSION = 1;

// Use JSON file for storage
const FILENAME = 'db.json';

export type statsMetricsType = {
	version: string | null,
	server_date: Date | null,
	number_of_sessions: number | null,
	host_cpu_utilization: number | null,
	io_requests_per_second: number | null,
	buffer_cache_hit_ratio: number | null,
	executions_per_sec: number | null,
	flashback_percentage: number | null,
	last_successful_rman_backup_date_full_db: Date | null,
	last_successful_rman_backup_date_archive_log: Date | null,
	last_rman_backup_date_full_db: Date | null,
	last_rman_backup_date_archive_log: Date | null,
};

export type statsDataType = {
	startDate: Date,
	endDate: Date | null,
	success: boolean,
	message: string,
	metrics: statsMetricsType,
};

/**
 * Database configuration object.
 */
export type databaseStatsType = {
	name: string,
	data: Array<statsDataType>,
};

/**
 * Configuration object.
 */
export type statsType = {
	magic: 'MAGIC',
	version: number,
	databases: Array<databaseStatsType>,
};

/**
 * Load statistics.
 *
 * @return {statsType} - The stored statistics.
 */
export function statsLoad(): statsType {
	let stats = initStats();
	
	try {
		stats = jsonLoad(FILENAME) as statsType;
	// eslint-disable-next-line no-empty
	} catch (_) {}

	if (stats.magic !== MAGIC) {
		throw new Error(`Statistics database in file "${FILENAME}" is invalid.`);
	}

	if (stats.version !== VERSION) {
		throw new Error(`Statistics database in file "${FILENAME}" has version "${stats.version}" instead of "${VERSION}".`);
	}

	return stats;
}

/**
 * Save statistics.
 *
 * @return {statsType} - The stored statistics.
 */
export function statsSave(stats: statsType): void {
	stats.magic = MAGIC;
	jsonSave(FILENAME, stats);
}

/*
*	Initialize stats
*/
function initStats(): statsType {
	return {
		magic: MAGIC,
		version: VERSION,
		databases: [],
	};
}
