import {jsonLoad} from './util/files.js';
import {isInteger} from './util/util.js';
import type {connectionOptionsType} from './gatherer/oracle.js';

type externConfigSchemaType = {
	enabled?: boolean,
	name: string,
	username: string,
	password: string,
};

type externConfigContainerDatabaseType = {
	port?: number,
	service?: string,
	username?: string,
	password?: string,
};

type externConfigDatabaseType = {
	enabled?: boolean,
	name: string,
	port: number,
	service: string,
	username: string,
	password: string,
	containerDatabase?: externConfigContainerDatabaseType,
	schemas: externConfigSchemaType[],
};

type externConfigHostType = {
	enabled?: boolean,
	name: string,
	host: string,
	databases: externConfigDatabaseType[],
};

type externConfigType = {
	http_port?: number,
	pollingSeconds?: number,
	hosts: externConfigHostType[],
};

export type databaseKeyType = {
	id: number,
	hostName: string,
	databaseName: string,
	schemaName: string, // the schema name is empty of we only work on the database level
};

export type databaseType = databaseKeyType & {
	cdbConnect: connectionOptionsType,
	pdbConnect: connectionOptionsType,
	schemaConnect: connectionOptionsType,
	enabled: boolean,
};

export type configType = {
	http_port: number,
	pollingSeconds: number,
	databases: databaseType[],
};

export type treeSchemaType = {
	name: string,
	schemaConnect: connectionOptionsType,
};

export type treeDatabaseType = {
	name: string,
	cdbConnect: connectionOptionsType,
	pdbConnect: connectionOptionsType,
	schemas: treeSchemaType[],
};

export type treeHostType = {
	name: string,
	databases: treeDatabaseType[],
};

/**
 * Returns a configuration object.
 *
 * @param {string} [filename='config.json'] - The configuration filename.
 * @returns {configType} - A configuration object.
 */
export function configLoad(filename = 'config.json'): configType {
	const config = jsonLoad<externConfigType>(filename);

	return validateConfig(config);
}

/*
 * Validates and returns a configuration object.
 *
 * @param {externConfigType} externalConfig - - The external configuration object.
 * @returns {configType} - The validated internal configuration object.
 */
export function validateConfig(externalConfig: Partial<externConfigType>): configType {
	const config: configType = {
		http_port: 80,
		pollingSeconds: 60,
		databases: [],
	};

	// port
	if ('http_port' in externalConfig) {
		if (!isInteger(externalConfig.http_port) || externalConfig.http_port <= 0 || externalConfig.http_port > 65536) {
			throw new Error('The configuration has no valid property "port"');
		} else {
			config.http_port = externalConfig.http_port;
		}
	}

	// pollingSeconds
	if ('pollingSeconds' in externalConfig) {
		if (!isInteger(externalConfig.pollingSeconds) || externalConfig.pollingSeconds <= 0) {
			throw new Error('The configuration has no valid property "pollingSeconds"');
		} else {
			config.pollingSeconds = externalConfig.pollingSeconds;
		}
	}

	// hosts
	if (!Array.isArray(externalConfig.hosts)) {
		throw new Error('The configuration has no property "hosts" of type array');
	}

	// validate the structure of the hosts
	config.databases = validateHosts(externalConfig.hosts);

	return config;
}

/*
 * Validates and returns a configuration object.
 *
 * @param {databaseType[]} databases - - The databases.
 * @returns {configTreeType} - The configuration as a tree.
 */
export function buildTree(databases: databaseType[]): treeHostType[] {
	const tree = [] as treeHostType[];

	databases.forEach(database => {
		// find host name
		const fh = tree.find(e => e.name === database.hostName);
		if (fh) {
			// find database name
			const fd = fh.databases.find(e => e.name === database.databaseName);
			if (fd) {
				// add schema
				fd.schemas.push({
					name: database.schemaName,
					schemaConnect: database.schemaConnect,
				});
			} else {
				// add database
				fh.databases.push({
					name: database.databaseName,
					cdbConnect: database.cdbConnect,
					pdbConnect: database.pdbConnect,
					schemas: [{
						name: database.schemaName,
						schemaConnect: database.schemaConnect,
					}],
				});
			}
		} else {
			// add host
			tree.push({
				name: database.hostName,
				databases: [{
					name: database.databaseName,
					cdbConnect: database.cdbConnect,
					pdbConnect: database.pdbConnect,
					schemas: [{
						name: database.schemaName,
						schemaConnect: database.schemaConnect,
					}],
				}],
			});
		}
	});

	return tree;
}

/*
 * Validates hosts
 */
function validateHosts(hosts: externConfigHostType[]): databaseType[] {
	const databases: databaseType[] = [];
	let id = 1;

	// process all hosts
	hosts.forEach((host, hostIndex) => {
		const hostErrorLocation = `hosts[${hostIndex}]`;

		// enabled
		if ('enabled' in host) {
			if (typeof host.enabled !== 'boolean') {
				throw new Error(`"enabled" must be boolean: "${hostErrorLocation}"`);
			}
		}

		// name
		if (typeof host.name !== 'string' || host.name.length === 0) {
			throw new Error(`"name" must be non-empty string: "${hostErrorLocation}"`);
		}

		// host
		if (typeof host.host !== 'string' || host.host.length === 0) {
			throw new Error(`"host" must be non-empty string: "${hostErrorLocation}"`);
		}

		// hosts
		if (!Array.isArray(host.databases)) {
			throw new Error(`"databases" must be an array: "${hostErrorLocation}"`);
		}

		// process all databases
		host.databases.forEach((database, databaseIndex) => {
			const databaseErrorLocation = `${hostErrorLocation}.databases[${databaseIndex}]`;

			// enabled
			if ('enabled' in database) {
				if (typeof database.enabled !== 'boolean') {
					throw new Error(`"enabled" must be boolean: "${databaseErrorLocation}"`);
				}
			}

			// name
			if (typeof database.name !== 'string' || database.name.length === 0) {
				throw new Error(`"name" must be non-empty string: "${databaseErrorLocation}"`);
			}
			// port
			if ('port' in database) {
				if (!isInteger(database.port) || database.port <= 0 || database.port > 65536) {
					throw new Error(`"port" must be integer between 1 and 65536: "${databaseErrorLocation}"`);
				}
			}
			// service
			if (typeof database.service !== 'string' || database.service.length === 0) {
				throw new Error(`"service" must be non-empty string: "${databaseErrorLocation}"`);
			}
			// username
			if (typeof database.username !== 'string' || database.username.length === 0) {
				throw new Error(`"username" must be non-empty string: "${databaseErrorLocation}"`);
			}
			// password
			if (typeof database.password !== 'string' || database.password.length === 0) {
				throw new Error(`"password" must be non-empty string: "${databaseErrorLocation}"`);
			}

			// containerDatabase
			if ('containerDatabase' in database) {
				if (typeof database.containerDatabase !== 'object') {
					throw new Error(`"containerDatabase" must be an object: "${databaseErrorLocation}"`);
				}

				const containerDatabaseErrorLocation = `${databaseErrorLocation}.containerDatabase`;
				const containerDatabase = database.containerDatabase;

				// port
				if ('port' in containerDatabase) {
					if (!isInteger(containerDatabase.port) || containerDatabase.port <= 0 || containerDatabase.port > 65536) {
						throw new Error(`"port" must be integer between 1 and 65536: "${containerDatabaseErrorLocation}"`);
					}
				}

				// service
				if ('service' in containerDatabase) {
					if (typeof containerDatabase.service !== 'string' || containerDatabase.service.length === 0) {
						throw new Error(`"service" must be non-empty string: "${containerDatabaseErrorLocation}"`);
					}
				}

				// username
				if ('username' in containerDatabase) {
					if (typeof containerDatabase.username !== 'string' || containerDatabase.username.length === 0) {
						throw new Error(`"username" must be non-empty string: "${containerDatabaseErrorLocation}"`);
					}
				}

				// password
				if ('password' in containerDatabase) {
					if (typeof containerDatabase.password !== 'string' || containerDatabase.password.length === 0) {
						throw new Error(`"password" must be non-empty string: "${containerDatabaseErrorLocation}"`);
					}
				}
			}

			// schemas
			if (!Array.isArray(database.schemas)) {
				throw new Error(`"schemas" must be an array: "${databaseErrorLocation}"`);
			}

			const containerDatabase = getContainerDatabase(database);
			const cdbConnect = {
				connection: getConnectionString(host.host, containerDatabase.port, containerDatabase.service),
				username: containerDatabase.username,
				password: containerDatabase.password,
			};

			const pdbConnect = {
				connection: getConnectionString(host.host, database.port, database.service),
				username: database.username,
				password: database.password,
			};

			const schemaConnect = {
				connection: getConnectionString(host.host, database.port, database.service),
				username: database.username,
				password: database.password,
			};

			// if we are only working on the database level but not all the way to the schema level
			if (database.schemas.length === 0) {
				databases.push({
					id: id++,
					hostName: host.name,
					databaseName: database.name,
					schemaName: '',
					cdbConnect,
					pdbConnect,
					schemaConnect,
					enabled: isDatabaseEnabled(host, database),
				});
			}

			// process all schemas
			database.schemas.forEach((schema, schemaIndex) => {
				const schemaErrorLocation = `${databaseErrorLocation}.schemas[${schemaIndex}]`;

				// enabled
				if ('enabled' in schema) {
					if (typeof schema.enabled !== 'boolean') {
						throw new Error(`"enabled" must be boolean: "${schemaErrorLocation}"`);
					}
				}

				// name
				if (typeof schema.name !== 'string' || schema.name.length === 0) {
					throw new Error(`"name" must be non-empty string: "${schemaErrorLocation}"`);
				}

				// username
				if (typeof schema.username !== 'string' || schema.username.length === 0) {
					throw new Error(`"username" must be non-empty string: "${schemaErrorLocation}"`);
				}

				// password
				if (typeof schema.password !== 'string' || schema.password.length === 0) {
					throw new Error(`"password" must be non-empty string: "${schemaErrorLocation}"`);
				}

				schemaConnect.username = schema.username;
				schemaConnect.password = schema.password;

				databases.push({
					id: id++,
					hostName: host.name,
					databaseName: database.name,
					schemaName: schema.name,
					cdbConnect,
					pdbConnect,
					schemaConnect,
					enabled: isSchemaEnabled(host, database, schema),
				});
			});
		});
	});

	return databases;
}

function isDatabaseEnabled(host: externConfigHostType, database: externConfigDatabaseType): boolean {
	if (typeof host.enabled === 'boolean' && host.enabled === false) {
		return false;
	}

	if (typeof database.enabled === 'boolean' && database.enabled === false) {
		return false;
	}

	return true;
}

function isSchemaEnabled(host: externConfigHostType, database: externConfigDatabaseType, schema: externConfigSchemaType): boolean {
	if (typeof host.enabled === 'boolean' && host.enabled === false) {
		return false;
	}

	if (typeof database.enabled === 'boolean' && database.enabled === false) {
		return false;
	}

	if (typeof schema.enabled === 'boolean' && schema.enabled === false) {
		return false;
	}

	return true;
}

/*
 * Compute defauls in all hosts
 */
function getContainerDatabase(database: externConfigDatabaseType): Required<externConfigContainerDatabaseType> {
	const containerDatabase: Required<externConfigContainerDatabaseType> = {
		port: 0,
		service: '',
		username: '',
		password: '',
	};

	if (typeof database.containerDatabase !== 'object') {
		containerDatabase.port = database.port;
		containerDatabase.service = database.service;
		containerDatabase.username = database.username;
		containerDatabase.password = database.password;
	} else {
		if (typeof database.containerDatabase.port !== 'number') {
			containerDatabase.port = database.port;
		} else {
			containerDatabase.port = database.containerDatabase.port;
		}
		if (typeof database.containerDatabase.service !== 'string') {
			containerDatabase.service = database.service;
		} else {
			containerDatabase.service = database.containerDatabase.service;
		}
		if (typeof database.containerDatabase.username !== 'string') {
			containerDatabase.username = database.username;
		} else {
			containerDatabase.username = database.containerDatabase.username;
		}
		if (typeof database.containerDatabase.password !== 'string') {
			containerDatabase.password = database.password;
		} else {
			containerDatabase.password = database.containerDatabase.password;
		}
	}

	return containerDatabase;
}

/*
 * Create a connection
 */
function getConnectionString(host: string, port: number, service: string): string {
	return `${host}:${port}/${service}`;
}
