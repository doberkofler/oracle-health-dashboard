//import debugModule from 'debug';
import {getConnectionString} from '../database/oracle.js';

import type {configDatabaseType, configHostType, configSchemaType} from './config.js';
import type {connectionOptionsType} from '../database/oracle.js';

//const debug = debugModule('oracle-health-dashboard:connection');

export const getConnectionDatabase = (host: configHostType, database: configDatabaseType): connectionOptionsType => {
	return {
		connectionString: getConnectionString(host.address, database.port, database.service),
		username: database.username,
		password: database.password,
	};
};

export const getConnectionContainerDatabase = (host: configHostType, database: configDatabaseType): connectionOptionsType | null => {
	return database.containerDatabase ? {
		connectionString:  getConnectionString(host.address, database.containerDatabase.port, database.containerDatabase.service),
		username: database.containerDatabase.username,
		password: database.containerDatabase.password,
	} : null;
};

export const getConnectionSchema = (host: configHostType, database: configDatabaseType, schema: configSchemaType): connectionOptionsType => {
	return {
		connectionString: getConnectionString(host.address, database.port, database.service),
		username: schema.username,
		password: schema.password,
	};
};
