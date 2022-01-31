import {jsonLoad} from '../util/files.js';
import {isInteger} from '../util/util.js';

// types used for the configuration
export type configSchemaType = {
	enabled: boolean,
	name: string,
	username: string,
	password: string,
};
export type configContainerDatabaseType = {
	port: number,
	service: string,
	username: string,
	password: string,
};
export type configDatabaseType = {
	enabled: boolean,
	name: string,
	port: number,
	service: string,
	username: string,
	password: string,
	containerDatabase: configContainerDatabaseType | null,
	schemas: configSchemaType[],
};
export type configHostType = {
	enabled: boolean,
	name: string,
	address: string,
	probe: boolean,
	databases: configDatabaseType[],
};
export type configType = {
	http_port: number,
	pollingSeconds: number,
	hidePasswords: boolean,
	hosts: configHostType[],
};

// types used when validating the configuration
type partialConfigDatabaseType = Partial<Omit<configDatabaseType, 'containerDatabase' | 'schemas'>> & {
	containerDatabase?: Partial<configContainerDatabaseType>,
	schemas?: Partial<configSchemaType>[],
};
type partialConfigHostType = Partial<Omit<configHostType, 'databases'>> & {
	databases?: partialConfigDatabaseType[],
};
type partialConfigType = Partial<Omit<configType, 'hosts'>> & {
	hosts?: partialConfigHostType[],
};

// types used when using an individual host/database/schema
export type flatDatabaseType = Omit<configDatabaseType, 'schemas'>;
export type flatHostType = Omit<configHostType, 'databases'>;
export type flatType = {
	host: flatHostType,
	database: flatDatabaseType,
	schema?: configSchemaType,
};

/**
 * Returns a flat host/database/schema object.
 *
 * @param {configHostType} host - The host.
 * @param {configDatabaseType} database - The database.
 * @param {configSchemaType | null | undefined} [schema] - The optional schema.
 * @returns {flatType} - A flat host/database/schema type.
 */
export function getFlat(host: configHostType, database: configDatabaseType, schema?: configSchemaType | null | undefined): flatType {
	const flat: flatType = {
		host: {
			enabled: host.enabled,
			name: host.name,
			address: host.address,
			probe: host.probe,
		},
		database : {
			enabled: database.enabled,
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

/**
 * Returns a configuration object.
 *
 * @param {string} [filename='config.json'] - The configuration filename.
 * @returns {configType} - A configuration object.
 */
export function configLoad(filename = 'config.json'): configType {
	const config = jsonLoad<partialConfigType>(filename);

	return validateConfig(config);
}

/*
 * Validates and returns a configuration object.
 *
 * @param {Partial<configType>} externalConfig - - The external configuration object.
 * @returns {partialConfigType} - The validated internal configuration object.
 */
export function validateConfig(config: partialConfigType): configType {
	const newConfig: configType = {
		http_port: 80,
		pollingSeconds: 60,
		hidePasswords: false,
		hosts: [],
	};

	if (typeof config !== 'object') {
		throw new Error('The configuration is not an object');
	}

	// port
	if ('http_port' in config) {
		if (!isInteger(config.http_port) || config.http_port <= 0 || config.http_port > 65536) {
			throw new Error('The configuration has no valid property "port"');
		} else {
			newConfig.http_port = config.http_port;
		}
	}

	// pollingSeconds
	if ('pollingSeconds' in config) {
		if (!isInteger(config.pollingSeconds) || config.pollingSeconds <= 0) {
			throw new Error('The configuration has no valid property "pollingSeconds"');
		} else {
			newConfig.pollingSeconds = config.pollingSeconds;
		}
	}

	// hidePasswords
	if ('hidePasswords' in config) {
		if (typeof config.hidePasswords !== 'boolean') {
			throw new Error('The configuration has no valid property "hidePasswords"');
		} else {
			newConfig.hidePasswords = config.hidePasswords;
		}
	}

	// hosts
	if (!Array.isArray(config.hosts)) {
		throw new Error('The configuration has no property "hosts" of type array');
	}

	// validate the structure of the hosts
	newConfig.hosts = config.hosts.map((host, index) => validateHost(host, index));

	// make sure that the host names are unique
	newConfig.hosts.forEach(host => {
		if (newConfig.hosts.filter(e => e.name === host.name).length > 1) {
			throw new Error(`The host name "${host.name}" is used multiple times`);
		}
	});

	return newConfig;
}

/*
 * validateHost
 */
function validateHost(host: partialConfigHostType, hostIndex: number): configHostType {
	const newHost: configHostType = {
		enabled: true,
		name: '',
		address: '',
		probe: true,
		databases: [],
	};

	const hostErrorLocation = `hosts[${hostIndex}]`;

	// enabled
	if ('enabled' in host) {
		if (typeof host.enabled !== 'boolean') {
			throw new Error(`"enabled" must be boolean: "${hostErrorLocation}"`);
		} else {
			newHost.enabled = host.enabled;
		}
	}

	// name
	if (typeof host.name !== 'string' || host.name.length === 0) {
		throw new Error(`"name" must be non-empty string: "${hostErrorLocation}"`);
	} else {
		newHost.name = host.name;
	}

	// host
	if (typeof host.address !== 'string' || host.address.length === 0) {
		throw new Error(`"address" must be non-empty string: "${hostErrorLocation}"`);
	} else {
		newHost.address = host.address;
	}

	// probe
	if ('probe' in host) {
		if (typeof host.probe !== 'boolean') {
			throw new Error(`"probe" must be boolean: "${hostErrorLocation}"`);
		} else {
			newHost.probe = host.probe;
		}
	}

	// databases
	if (!Array.isArray(host.databases)) {
		throw new Error(`"databases" must be an array: "${hostErrorLocation}"`);
	} else {
		newHost.databases = host.databases.map((database, index) => validateDatabase(hostErrorLocation, database, index));
	}

	// make sure that the database names are unique
	newHost.databases.forEach(database => {
		if (newHost.databases.filter(e => e.name === database.name).length > 1) {
			throw new Error(`The database name "${database.name}" is used multiple times: "${hostErrorLocation}"`);
		}
	});

	return newHost;
}

/*
*	validateDatabase
*/
function validateDatabase(hostErrorLocation: string, database: partialConfigDatabaseType, databaseIndex: number): configDatabaseType {
	const newDatabase: configDatabaseType = {
		enabled: true,
		name: '',
		port: 1521,
		service: '',
		username: '',
		password: '',
		containerDatabase: null,
		schemas: [],
	
	};

	const databaseErrorLocation = `${hostErrorLocation}.databases[${databaseIndex}]`;

	// enabled
	if ('enabled' in database) {
		if (typeof database.enabled !== 'boolean') {
			throw new Error(`"enabled" must be boolean: "${databaseErrorLocation}"`);
		} else {
			newDatabase.enabled = database.enabled;
		}
	}

	// name
	if (typeof database.name !== 'string' || database.name.length === 0) {
		throw new Error(`"name" must be non-empty string: "${databaseErrorLocation}"`);
	} else {
		newDatabase.name = database.name;
	}

	// port
	if ('port' in database) {
		if (!isInteger(database.port) || database.port <= 0 || database.port > 65536) {
			throw new Error(`"port" must be integer between 1 and 65536: "${databaseErrorLocation}"`);
		} else {
			newDatabase.port = database.port;
		}
	}

	// service
	if (typeof database.service !== 'string' || database.service.length === 0) {
		throw new Error(`"service" must be non-empty string: "${databaseErrorLocation}"`);
	} else {
		newDatabase.service = database.service;
	}

	// username
	if (typeof database.username !== 'string' || database.username.length === 0) {
		throw new Error(`"username" must be non-empty string: "${databaseErrorLocation}"`);
	} else {
		newDatabase.username = database.username;
	}

	// password
	if (typeof database.password !== 'string' || database.password.length === 0) {
		throw new Error(`"password" must be non-empty string: "${databaseErrorLocation}"`);
	} else {
		newDatabase.password = database.password;
	}

	// containerDatabase
	if ('containerDatabase' in database) {
		if (typeof database.containerDatabase !== 'object') {
			throw new Error(`"containerDatabase" must be an object: "${databaseErrorLocation}"`);
		}

		const containerDatabaseErrorLocation = `${databaseErrorLocation}.containerDatabase`;
		const containerDatabase = database.containerDatabase;

		newDatabase.containerDatabase = {
			port: newDatabase.port,
			service: newDatabase.service,
			username: newDatabase.username,
			password: newDatabase.password,
		};

		// port
		if ('port' in containerDatabase) {
			if (!isInteger(containerDatabase.port) || containerDatabase.port <= 0 || containerDatabase.port > 65536) {
				throw new Error(`"port" must be integer between 1 and 65536: "${containerDatabaseErrorLocation}"`);
			} else {
				newDatabase.containerDatabase.port = containerDatabase.port;
			}
		}

		// service
		if ('service' in containerDatabase) {
			if (typeof containerDatabase.service !== 'string' || containerDatabase.service.length === 0) {
				throw new Error(`"service" must be non-empty string: "${containerDatabaseErrorLocation}"`);
			} else {
				newDatabase.containerDatabase.service = containerDatabase.service;
			}
		}

		// username
		if ('username' in containerDatabase) {
			if (typeof containerDatabase.username !== 'string' || containerDatabase.username.length === 0) {
				throw new Error(`"username" must be non-empty string: "${containerDatabaseErrorLocation}"`);
			} else {
				newDatabase.containerDatabase.username = containerDatabase.username;
			}
		}

		// password
		if ('password' in containerDatabase) {
			if (typeof containerDatabase.password !== 'string' || containerDatabase.password.length === 0) {
				throw new Error(`"password" must be non-empty string: "${containerDatabaseErrorLocation}"`);
			} else {
				newDatabase.containerDatabase.password = containerDatabase.password;
			}
		}
	}

	// schemas
	if (!Array.isArray(database.schemas)) {
		throw new Error(`"schemas" must be an array: "${databaseErrorLocation}"`);
	} else {
		newDatabase.schemas = database.schemas.map((schema, index) => validateSchema(databaseErrorLocation, schema, index));
	}

	// make sure that the schema names are unique
	newDatabase.schemas.forEach(schema => {
		if (newDatabase.schemas.filter(e => e.name === schema.name).length > 1) {
			throw new Error(`The schema name "${schema.name}" is used multiple times: "${databaseErrorLocation}"`);
		}
	});
	
	return newDatabase;
}

/*
*	validateSchema
*/
function validateSchema(databaseErrorLocation: string, schema: Partial<configSchemaType>, schemaIndex: number): configSchemaType {
	const schemaErrorLocation = `${databaseErrorLocation}.schemas[${schemaIndex}]`;
	const newSchema: configSchemaType = {
		enabled: true,
		name: '',
		username: '',
		password: '',
	};

	// enabled
	if ('enabled' in schema) {
		if (typeof schema.enabled !== 'boolean') {
			throw new Error(`"enabled" must be boolean: "${schemaErrorLocation}"`);
		} else {
			newSchema.enabled = schema.enabled;
		}
	}

	// name
	if (typeof schema.name !== 'string' || schema.name.length === 0) {
		throw new Error(`"name" must be non-empty string: "${schemaErrorLocation}"`);
	} else {
		newSchema.name = schema.name;
	}

	// username
	if (typeof schema.username !== 'string' || schema.username.length === 0) {
		throw new Error(`"username" must be non-empty string: "${schemaErrorLocation}"`);
	} else {
		newSchema.username = schema.username;
	}

	// password
	if (typeof schema.password !== 'string' || schema.password.length === 0) {
		throw new Error(`"password" must be non-empty string: "${schemaErrorLocation}"`);
	} else {
		newSchema.password = schema.password;
	}

	return newSchema;
}
