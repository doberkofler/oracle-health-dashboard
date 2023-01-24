//import debugModule from 'debug';
import {getConnectionDatabase, getConnectionContainerDatabase, getConnectionSchema} from './connection';
//import {prettyFormat} from '../util/util';

import type {
	configSchemaType,
	configHostType,
	justHostType,
	justDatabaseType,
	flatType,
} from '../shared/types';
import type {connectionOptionsType, connectionFlagsType} from './connection';
import type {statsHostType, dynamicMetricType, statsSchemaType, staticMetricType} from '../shared/types';

type flatDynamicType = Omit<dynamicMetricType, 'schemas'> & {schema: null | statsSchemaType};
type statsType = {
	statics: staticMetricType | null,
	dynamic: flatDynamicType | null,
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
 * @param host - The host.
 * @param database - The database.
 * @param [schema] - The optional schema.
 * @returns A flat host/database/schema type.
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
	const host = statsHosts.find(e => e.hostName === hostName);
	if (!host) {
		return stats;
	}

	// database
	const database = host.databases.find(e => e.databaseName === databaseName);
	if (!database) {
		return stats;
	}

	if (!database.static) {
		return stats;
	}

	// static
	stats.statics = database.static;

	// dynamic
	if (database.metrics.length > 0) {
		const lastStats = database.metrics[database.metrics.length - 1];
		const schemaStats = lastStats.schemas.find(e => e.schemaName === schemaName);
		const lastStatsFlat: flatDynamicType = Object.assign({}, lastStats, {schema: schemaStats ? schemaStats : null});

		delete (lastStatsFlat as any).schemas; // eslint-disable-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any

		stats.dynamic = lastStatsFlat;
	}

	return stats;
};
