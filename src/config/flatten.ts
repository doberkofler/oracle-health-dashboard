import debugModule from 'debug';
import {getConnectionDatabase, getConnectionContainerDatabase, getConnectionSchema} from './connection.js';
import {getFlat} from '../config/config.js';

import type {configHostType} from './config.js';
import type {connectionOptionsType} from '../database/oracle.js';

export type flattenedType = {
	id: number,
	hostName: string,
	hostSwitch: boolean,
	hostSchemaCount: number,
	databaseName: string,
	databaseConnection: connectionOptionsType,
	containerConnection: connectionOptionsType | null,
	databaseSwitch: boolean,
	databaseSchemaCount: number,
	schemaName: string,
	schemaConnection: connectionOptionsType,
};

const debug = debugModule('oracle-health-dashboard:flatten');

export const flatten = (hosts: configHostType[]): flattenedType[] => {
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
					hostSwitch,
					hostSchemaCount,
					databaseName: database.name,
					databaseConnection: getConnectionDatabase(getFlat(host, database)),
					containerConnection: getConnectionContainerDatabase(getFlat(host, database)),
					databaseSwitch,
					databaseSchemaCount,
					schemaName: schema.name,
					schemaConnection: getConnectionSchema(getFlat(host, database, schema)),
				});

				hostSwitch = false;
				hostSchemaCount = 0;
				databaseSwitch = false;
				databaseSchemaCount = 0;
			});
		});
	});

	debug({hosts, flattened});

	return flattened;
};
