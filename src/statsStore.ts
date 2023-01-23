import {jsonLoad, jsonSave} from './util/files';
import {prettyFormat} from './util/util';
import fs from 'fs';
import {z} from 'zod';

import {z$statsType, z$statsInitType, z$statsAddDataType} from './types';

import type {statsHostType, statsInitType, statsDatabaseType, statsAddDataType} from './types';

const MAGIC = 'MAGIC';
const VERSION = 1;

// Use JSON file for storage
const FILENAME = 'db.json';

/*
 * Save statistics.
 */
const statsSave = (hosts: statsHostType[]): void => {
	const data = z$statsType.parse({
		magic: MAGIC,
		version: VERSION,
		hosts,
	});

	jsonSave(FILENAME, data);
};

/*
 * Find database.
 */
const findDatabase = (stats: statsHostType[], hostName: string, databaseName: string): statsDatabaseType => {
	const host = stats.find(e => e.hostName === hostName);
	if (!host) {
		throw new Error(`Unable to find host "${hostName}"`);
	}

	const database = host.databases.find(e => e.databaseName === databaseName);
	if (!database) {
		throw new Error(`Unable to find database "${databaseName}" in host "${hostName}" in "${prettyFormat(stats)}"`);
	}

	return database;
};

/**
 * Remove statistics.
 *
 */
export const statsRemove = (): void => {
	fs.unlinkSync(FILENAME);
};

/**
 * Load statistics.
 *
 * @return The stored statistics.
 */
export const statsLoad = (): statsHostType[] => {
	let data: unknown;

	try {
		data = jsonLoad(FILENAME);
	} catch (e: unknown) {
		throw new Error(`Statistics database in file "${FILENAME}" not found.`);
	}

	const stats =  z$statsType.parse(data);

	if (stats.magic !== MAGIC) {
		throw new Error(`Statistics database in file "${FILENAME}" is invalid.\n${prettyFormat(stats)}`);
	}

	if (stats.version !== VERSION) {
		throw new Error(`Statistics database in file "${FILENAME}" has version "${stats.version}" instead of "${VERSION}".\n${prettyFormat(stats)}`);
	}

	return stats.hosts;
};

/**
 * Initialize statistics.
 *
 * @param data - The stored statistics.
 */
export const statsInitial = (data: statsInitType[]): void => {
	// validate
	z.array(z$statsInitType).parse(data);

	const hosts = [] as statsHostType[];
	data.forEach(row => {
		// host
		let host = hosts.find(e => e.hostName === row.hostName);
		if (!host) {
			host = {
				hostName: row.hostName,
				databases: [],
			} as statsHostType;
			hosts.push(host);
		}

		// database
		let database = host.databases.find(e => e.databaseName === row.databaseName);
		if (!database) {
			database = {
				databaseName: row.databaseName,
				static: row.static,
				metrics: [],
			} as statsDatabaseType;
			host.databases.push(database);
		}
	});
	
	statsSave(hosts);
};

/**
 * Add statistics.
 *
 * @param data - The data to store.
 */
export const statsAdd = (data: statsAddDataType[]): void => {
	// validate the given data
	z.array(z$statsAddDataType).parse(data);

	// load existing stats
	const stats = statsLoad();

	// add new metrics
	data.forEach(e => {
		const database = findDatabase(stats, e.hostName, e.databaseName);
		const metric = Object.assign({}, e.metric, {
			status: e.status,
			schemas: e.schemas,
		});

		database.metrics.push(metric);
	});

	// save stats
	statsSave(stats);
};
