//import debugModule from 'debug';
import {getConnectionString} from '../database/oracle.js';

import type {flatType} from './config.js';
import type {connectionOptionsType} from '../database/oracle.js';

//const debug = debugModule('oracle-health-dashboard:connection');

export const getConnectionDatabase = (flat: flatType): connectionOptionsType => {
	return {
		connectionString: getConnectionString(flat.host.address, flat.database.port, flat.database.service),
		username: flat.database.username,
		password: flat.database.password,
	};
};

export const getConnectionContainerDatabase = (flat: flatType): connectionOptionsType | null => {
	return flat.database.containerDatabase ? {
		connectionString:  getConnectionString(flat.host.address, flat.database.containerDatabase.port, flat.database.containerDatabase.service),
		username: flat.database.containerDatabase.username,
		password: flat.database.containerDatabase.password,
	} : null;
};

export const getConnectionSchema = (flat: flatType): connectionOptionsType => {
	if (!flat.schema) {
		throw new Error('schema is missing');
	}

	return {
		connectionString: getConnectionString(flat.host.address, flat.database.port, flat.database.service),
		username: flat.schema.username,
		password: flat.schema.password,
	};
};
