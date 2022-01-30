import {jsonLoad, jsonSave} from './util/files.js';
import {inspect} from './util/util.js';
import type {statusType, metricType} from './database/worker.js';
import type {sqlInitialType} from './database/initialize.js';

const MAGIC = 'MAGIC';
const VERSION = 1;

// Use JSON file for storage
const FILENAME = 'db.json';

export type statsKeyType = {
	hostName: string,
	databaseName: string,
};

export type statsInitialType = statsKeyType & {
	statics?: sqlInitialType,
};

export type statsAddDataType = statsKeyType & {
	status: statusType,
	metric: metricType,
};

export type statusMetricType = statusType & metricType;

export type statsDatabaseType = statsKeyType & {
	statics?: sqlInitialType,
	metrics: statusMetricType[],
};

export type statsType = {
	magic: string,
	version: number,
	databases: statsDatabaseType[],
};

/**
 * Initialize statistics.
 *
 * @param {initialGatherType} data - The stored statistics.
 */
export function statsInitial(data: statsInitialType[]): void {
	const database: statsDatabaseType[] = data.map(e => ({
		hostName: e.hostName,
		databaseName: e.databaseName,
		statics: e.statics,
		metrics: [],
	}));

	statsSave(database);
}

/**
 * Load statistics.
 *
 * @return {statsDatabaseType[]} - The stored statistics.
 */
export function statsLoad(): statsDatabaseType[] {
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

	return stats.databases;
}

/**
 * Add statistics.
 *
 * @param {statsDatabaseType[]} newData - The data to store.
 */
export function statsAdd(newData: statsAddDataType[]): void {
	const oldDatabase = statsLoad();

	newData.forEach(e => {
		const database = oldDatabase.find(ee => ee.hostName === e.hostName && ee.databaseName === e.databaseName);
		if (!database) {
			throw new Error(`Unable to find database with hostName "${e.hostName}" and databaseName ${e.databaseName} in "${inspect(oldDatabase)}"`);
		}

		const metric = Object.assign({}, e.metric, e.status);
		database.metrics.push(metric);
	});

	statsSave(oldDatabase);
}

/*
 * Save statistics.
 */
function statsSave(database: statsDatabaseType[]): void {
	const stats: statsType = {
		magic: MAGIC,
		version: VERSION,
		databases: database,
	};

	jsonSave(FILENAME, stats);
}
