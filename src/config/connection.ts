//import debugModule from 'debug';

import type {flatType} from './types.js';

//const debug = debugModule('oracle-health-dashboard:connection');

export type connectionOptionsType = {
	connectionString: string,
	username: string,
	password: string,
};

/*
 * Get connection string
 */
export function getConnectionString(address: string, port: number, service: string): string {
	return `${address}:${port}/${service}`;
}

/*
 * Get a connection as string
 */
export function getConnectionAsString(connection: connectionOptionsType): string {
	let text = connection.username;

	if (connection.password.length > 0) {
		text += '/' + connection.password;
	}

	return text + '@' + connection.connectionString;
}

export const getConnectionBasic = (options: {
	address: string,
	port: number,
	service: string,
	username: string,
	password: string,
}): connectionOptionsType => {
	return {
		connectionString: getConnectionString(options.address, options.port, options.service),
		username: options.username,
		password: options.password,
	};
};

export const getConnectionDatabase = (flat: flatType, includePassword = true): connectionOptionsType => {
	return {
		connectionString: getConnectionString(flat.host.address, flat.database.port, flat.database.service),
		username: flat.database.username,
		password: includePassword ? flat.database.password : '',
	};
};

export const getConnectionContainerDatabase = (flat: flatType, includePassword = true): connectionOptionsType | null => {
	return flat.database.containerDatabase ? {
		connectionString:  getConnectionString(flat.host.address, flat.database.containerDatabase.port, flat.database.containerDatabase.service),
		username: flat.database.containerDatabase.username,
		password: includePassword ? flat.database.containerDatabase.password : '',
	} : null;
};

export const getConnectionSchema = (flat: flatType, includePassword = true): connectionOptionsType => {
	if (!flat.schema) {
		throw new Error('schema is missing');
	}

	return {
		connectionString: getConnectionString(flat.host.address, flat.database.port, flat.database.service),
		username: flat.schema.username,
		password: includePassword ? flat.schema.password : '',
	};
};
