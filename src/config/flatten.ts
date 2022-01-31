import debugModule from 'debug';
import {getConnectionDatabase, getConnectionContainerDatabase, getConnectionSchema} from './connection.js';
import {getFlat} from '../config/config.js';
import {inspect} from '../util/util.js';

import type {configHostType} from './config.js';
import type {statsHostType, dynamicMetricType} from '../statsStore.js';
import type {connectionOptionsType} from '../database/oracle.js';
import type {staticMetricType} from '../database/initialize.js';

type statsType = {
	statics: staticMetricType | null,
	dynamic: dynamicMetricType | null,
};

export type flattenedType = {
	id: number,
	hostName: string,
	hostProbe: boolean,
	hostSwitch: boolean,
	hostSchemaCount: number,
	databaseName: string,
	databaseConnection: connectionOptionsType,
	containerConnection: connectionOptionsType | null,
	databaseSwitch: boolean,
	databaseSchemaCount: number,
	schemaName: string,
	schemaConnection: connectionOptionsType,
	stats: statsType,
};

const debug = debugModule('oracle-health-dashboard:flatten');

export const flatten = (hosts: configHostType[], statsHosts: statsHostType[] = []): flattenedType[] => {
	const flattened: flattenedType[] = [];

	let id = 0;
	let hostSwitch = false;
	let hostSchemaCount = 0;
	let databaseSwitch = false;
	let databaseSchemaCount = 0;

	hosts.forEach(host => {
		hostSwitch = true;
		hostSchemaCount = host.databases.reduce((prev, curr) => prev + curr.schemas.length, 0);
		host.databases.forEach(database => {
			databaseSwitch = true;
			databaseSchemaCount = database.schemas.length;
			database.schemas.forEach(schema => {
				flattened.push({
					id: id++,
					hostName: host.name,
					hostProbe: host.probe,
					hostSwitch,
					hostSchemaCount,
					databaseName: database.name,
					databaseConnection: getConnectionDatabase(getFlat(host, database)),
					containerConnection: getConnectionContainerDatabase(getFlat(host, database)),
					databaseSwitch,
					databaseSchemaCount,
					schemaName: schema.name,
					schemaConnection: getConnectionSchema(getFlat(host, database, schema)),
					stats: getStats(statsHosts, host.name, database.name),
				});

				hostSwitch = false;
				hostSchemaCount = 0;
				databaseSwitch = false;
				databaseSchemaCount = 0;
			});
		});
	});

	debug(inspect({hosts, flattened}));

	return flattened;
};

const getStats = (statsHosts: statsHostType[], hostName: string, databaseName: string): statsType => {
	const stats = {
		statics: null,
		dynamic: null,
	} as statsType;

	// host
	const host = statsHosts.find(e => e.name === hostName);
	if (!host) {
		return stats;
	}

	// database
	const database = host.databases.find(e => e.name === databaseName);
	if (!database) {
		return stats;
	}

	if (!database.statics) {
		return stats;
	}

	stats.statics = database.statics ? database.statics : null;
	stats.dynamic = database.metrics.length > 0 ? database.metrics[database.metrics.length - 1] : null;

	return stats;
};
