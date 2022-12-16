//import debugModule from 'debug';
import {getConnectionDatabase, getConnectionContainerDatabase, getConnectionSchema} from './connection.js';
//import {prettyFormat} from '../util/util.js';

import type {
	configSchemaType,
	configHostType,
	justHostType,
	justDatabaseType,
	flatType,
} from './types.js';
import type {statsHostType, dynamicMetricType, statsSchemaType} from '../statsStore.js';
import type {connectionOptionsType, connectionFlagsType} from '../config/connection';
import type {staticMetricType} from '../database/initialize.js';

type flatDynamicType = Omit<dynamicMetricType, 'schemas'> & {schema: null | statsSchemaType};
type statsType = {
	statics: null | staticMetricType,
	dynamic: null | flatDynamicType,
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

//const debug = debugModule('oracle-health-dashboard:flatten');

/**
 * Returns a flat host/database/schema object.
 *
 * @param {justHostType} host - The host.
 * @param {justDatabaseType} database - The database.
 * @param {configSchemaType | null | undefined} [schema] - The optional schema.
 * @returns {flatType} - A flat host/database/schema type.
 */
export function getFlat(host: justHostType, database: justDatabaseType, schema?: configSchemaType | null | undefined): flatType {
	const flat: flatType = {
		host: {
			enabled: host.enabled,
			name: host.name,
			address: host.address,
			probe: host.probe,
		},
		database : {
			enabled: database.enabled,
			comment: database.comment,
			name: database.name,
			port: database.port,
			service: database.service,
			username: database.username,
			password: database.password,
			containerDatabase: database.containerDatabase,
		},
	};

	if (schema) {
		flat.schema = schema;
	}

	return flat;
}

export const flatten = (hosts: configHostType[], connectionFlags: connectionFlagsType, statsHosts: statsHostType[] = []): flattenedType[] => {
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
					databaseConnection: getConnectionDatabase(getFlat(host, database), connectionFlags),
					containerConnection: getConnectionContainerDatabase(getFlat(host, database), connectionFlags),
					databaseSwitch,
					databaseSchemaCount,
					schemaName: schema.name,
					schemaConnection: getConnectionSchema(getFlat(host, database, schema), connectionFlags),
					stats: getStats(statsHosts, host.name, database.name, schema.name),
				});

				hostSwitch = false;
				hostSchemaCount = 0;
				databaseSwitch = false;
				databaseSchemaCount = 0;
			});
		});
	});

	//debug(prettyFormat({hosts, flattened}));

	return flattened;
};

const getStats = (statsHosts: statsHostType[], hostName: string, databaseName: string, schemaName: string): statsType => {
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

	// static
	stats.statics = database.statics;

	// dynamic
	if (database.metrics.length > 0) {
		const lastStats = database.metrics[database.metrics.length - 1];
		const schemaStats = lastStats.schemas.find(e => e.name === schemaName);
		const lastStatsFlat: flatDynamicType = Object.assign({}, lastStats, {schema: schemaStats ? schemaStats : null});

		delete (lastStatsFlat as any).schemas; // eslint-disable-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any

		stats.dynamic = lastStatsFlat;
	}

	return stats;
};
