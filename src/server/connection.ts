//import debugModule from 'debug';

import type {configOptionsType, flatType} from '../shared/types';

//const debug = debugModule('oracle-health-dashboard:connection');

export type connectionOptionsType = {
	connectionString: string,
	username: string,
	password: string,
};

export type connectionFlagsType = {
	includePassword: boolean,
	connectTimeoutSeconds: number,
};

/*
* Get connection flag from config options
*/
export const getConnectionFlags = (options: configOptionsType): connectionFlagsType => ({
	includePassword: !options.hidePasswords,
	connectTimeoutSeconds: options.connectTimeoutSeconds,
});

/*
 * Get connection string
 */
export function getConnectionString(address: string, port: number, service: string, connectTimeoutSeconds: number): string {
	let connectionString = `${address}:${port}/${service}`;

	if (connectTimeoutSeconds > 0) {
		connectionString += `?connect_timeout=${connectTimeoutSeconds}`;
	}

	return connectionString;
}

/*
 * Get a connection as string
 */
export function connectionToString(connection: connectionOptionsType): string {
	let text = connection.username;

	if (connection.password.length > 0) {
		text += `/${connection.password}`;
	}

	return `${text}@${connection.connectionString}`;
}

export const getConnectionDatabase = (flat: flatType, flags: connectionFlagsType): connectionOptionsType => {
	return {
		connectionString: getConnectionString(flat.host.address, flat.database.port, flat.database.service, flags.connectTimeoutSeconds),
		username: flat.database.username,
		password: flags.includePassword ? flat.database.password : '',
	};
};

export const getConnectionContainerDatabase = (flat: flatType, flags: connectionFlagsType): connectionOptionsType | null => {
	return flat.database.containerDatabase ? {
		connectionString: getConnectionString(flat.host.address, flat.database.containerDatabase.port, flat.database.containerDatabase.service, flags.connectTimeoutSeconds),
		username: flat.database.containerDatabase.username,
		password: flags.includePassword ? flat.database.containerDatabase.password : '',
	} : null;
};

export const getConnectionSchema = (flat: flatType, flags: connectionFlagsType): connectionOptionsType => {
	if (!flat.schema) {
		throw new Error('schema is missing');
	}

	return {
		connectionString: getConnectionString(flat.host.address, flat.database.port, flat.database.service, flags.connectTimeoutSeconds),
		username: flat.schema.username,
		password: flags.includePassword ? flat.schema.password : '',
	};
};
