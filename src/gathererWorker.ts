import debugModule from 'debug';
import {expose} from 'threads/worker';
import {statsLoad, statsSave} from './statsStore.js';
import {gatherDatabase} from './database.js';
import type {configType} from './config.js';
import type {statsType} from './statsStore.js';

const debug = new debugModule('oracle-health-dashboard:gatherer');

export type Gatherer = typeof gatherer

expose(gatherer);

/**
 * Start statistics gathering.
 *
 * @param {databaseConfigType} config - The configuration object.
 * @returns {Promise<void>} - A promise that resolves when done.
 */
export async function gatherer(config: configType): Promise<void> {
	debug('gatherer');

	// loads statistics
	const temp = await statsLoad();

	// merge
	const stats = merge(config, temp);

	// save the statistics
	await statsSave(stats);

	// poll for statistics regularly
	await statsGather(config, stats);
}

/*
 * Gather statistics.
 */
async function statsGather(config: configType, stats: statsType): Promise<void> {
	debug('statsGather');

	// quere all databases and and wait until we got results from all of them
	const results = await Promise.all(config.databases.map(database => gatherDatabase(database)));

	// process the results
	results.forEach(result => {
		const f = stats.databases.find(e => e.name === result.name);
		if (!f) {
			throw new Error(`Unable to find database with name "${result.name}"`);
		}

		f.data.push(result.data);
	});

	// save the statistics
	await statsSave(stats);

	// repeat
	setTimeout(statsGather.bind(null, config, stats), config.pollingSeconds * 1000);
}

/*
 * Marge existing statistics with configuration.
 */
function merge(config: configType, stats: statsType): statsType {
	const newStats = stats;

	newStats.databases = config.databases.map(database => {
		const f = stats.databases.find(e => e.name.toLowerCase() === database.name.toLowerCase());

		return {
			name: database.name,
			data: f ? f.data : [],
		};
	});

	return newStats;
}
