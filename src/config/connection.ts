//import debugModule from 'debug';

import type {flatType} from './types.js';

//const debug = debugModule('oracle-health-dashboard:connection');

export type connectionOptionsType = {
	connectionString: string,
	username: string,
	password: string,
};

export type connectionFlagsType = {
	includePassword: boolean,
	useEasyConnectStringPlus: boolean,
};

/*
 * Get connection string
 */
export function getConnectionString(address: string, port: number, service: string, useEasyConnectStringPlus: boolean): string {
	let connectionString = `${address}:${port}/${service}`;

	if (useEasyConnectStringPlus) {
		connectionString += '?connect_timeout=15';
	}

	return connectionString;
}

/*
 * Get a connection as string
 */
export function connectionToString(connection: connectionOptionsType): string {
	let text = connection.username;

	if (connection.password.length > 0) {
		text += '/' + connection.password;
	}

	return text + '@' + connection.connectionString;
}

export const getConnectionDatabase = (flat: flatType, flags: connectionFlagsType): connectionOptionsType => {
	return {
		connectionString: getConnectionString(flat.host.address, flat.database.port, flat.database.service, flags.useEasyConnectStringPlus),
		username: flat.database.username,
		password: flags.includePassword ? flat.database.password : '',
	};
};

export const getConnectionContainerDatabase = (flat: flatType, flags: connectionFlagsType): connectionOptionsType | null => {
	return flat.database.containerDatabase ? {
		connectionString:  getConnectionString(flat.host.address, flat.database.containerDatabase.port, flat.database.containerDatabase.service, flags.useEasyConnectStringPlus),
		username: flat.database.containerDatabase.username,
		password: flags.includePassword ? flat.database.containerDatabase.password : '',
	} : null;
};

export const getConnectionSchema = (flat: flatType, flags: connectionFlagsType): connectionOptionsType => {
	if (!flat.schema) {
		throw new Error('schema is missing');
	}

	return {
		connectionString: getConnectionString(flat.host.address, flat.database.port, flat.database.service, flags.useEasyConnectStringPlus),
		username: flat.schema.username,
		password: flags.includePassword ? flat.schema.password : '',
	};
};
