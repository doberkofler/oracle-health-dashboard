import {jsonLoad, jsonSave} from './util/files.js';
import {prettyFormat} from './util/util.js';

import type {statusType, metricType, customStatsType} from './database/worker.js';
import type {staticMetricType} from './database/initialize.js';

const MAGIC = 'MAGIC';
const VERSION = 1;

// Use JSON file for storage
const FILENAME = 'db.json';

export type dynamicMetricType = metricType & {
	status: statusType,
	schemas: statsSchemaType[],
};

export type statsInitType = {
	hostName: string,
	databaseName: string,
	schemaName: string,
	statics: staticMetricType,
};

export type statsAddDataType = {
	hostName: string,
	databaseName: string,
	schemaName: string,
	status: statusType,
	metric: metricType,
	schemas: statsSchemaType[],
};

export type statsSchemaType = {
	name: string,
	status: statusType,
	custom: customStatsType,
};

export type statsDatabaseType = {
	name: string,
	statics?: staticMetricType,
	metrics: dynamicMetricType[],
};

export type statsHostType = {
	name: string,
	databases: statsDatabaseType[],
};

export type statsType = {
	magic: string,
	version: number,
	hosts: statsHostType[],
};

/**
 * Load statistics.
 *
 * @return {statsHostType[]} - The stored statistics.
 */
export function statsLoad(): statsHostType[] {
	let stats: statsType;

	try {
		stats = jsonLoad(FILENAME);
	} catch (e: unknown) {
		throw new Error(`Statistics database in file "${FILENAME}" not found.`);
	}

	if (stats.magic !== MAGIC) {
		throw new Error(`Statistics database in file "${FILENAME}" is invalid.\n${prettyFormat(stats)}`);
	}

	if (stats.version !== VERSION) {
		throw new Error(`Statistics database in file "${FILENAME}" has version "${stats.version}" instead of "${VERSION}".\n${prettyFormat(stats)}`);
	}

	return stats.hosts;
}

/**
 * Initialize statistics.
 *
 * @param {statsInitType[]} data - The stored statistics.
 */
export function statsInitial(data: statsInitType[]): void {
	const hosts = [] as statsHostType[];

	data.forEach(row => {
		// host
		let host = hosts.find(e => e.name === row.hostName);
		if (!host) {
			host = {
				name: row.hostName,
				databases: [],
			} as statsHostType;
			hosts.push(host);
		}

		// database
		let database = host.databases.find(e => e.name === row.databaseName);
		if (!database) {
			database = {
				name: row.databaseName,
				statics: row.statics,
				metrics: [],
			} as statsDatabaseType;
			host.databases.push(database);
		}
	});
	
	statsSave(hosts);
}

/**
 * Add statistics.
 *
 * @param {statsDatabaseType[]} rows - The data to store.
 */
export function statsAdd(rows: statsAddDataType[]): void {
	const oldHosts = statsLoad();

	rows.forEach(row => {
		// host
		const host = oldHosts.find(e => e.name === row.hostName);
		if (!host) {
			throw new Error(`Unable to find host "${row.hostName}"`);
		}

		// database
		const database = host.databases.find(e => e.name === row.databaseName);
		if (!database) {
			throw new Error(`Unable to find database "${row.databaseName}" in host "${row.hostName}" in "${prettyFormat(oldHosts)}"`);
		}

		const metric = Object.assign({}, row.metric, {
			status: row.status,
			schemas: row.schemas,
		});

		database.metrics.push(metric);
	});

	statsSave(oldHosts);
}

/*
 * Save statistics.
 */
function statsSave(hosts: statsHostType[]): void {
	const stats: statsType = {
		magic: MAGIC,
		version: VERSION,
		hosts,
	};

	jsonSave(FILENAME, stats);
}
