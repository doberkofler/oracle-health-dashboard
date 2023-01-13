import {jsonLoad} from '../util/files';
import {isInteger} from '../util/util';

import type {
	configSchemaType,
	configContainerDatabaseType,
	configDatabaseType,
	configHostType,
	configCustomRepository,
	configOptionsType,
	configType,
} from './types';

// types used when validating the configuration
type partialConfigSchemaType = Partial<configSchemaType> & {
	customPropertiesSelects?: string | string[],
};
type partialConfigDatabaseType = Partial<Omit<configDatabaseType, 'containerDatabase' | 'schemas'>> & {
	containerDatabase?: Partial<configContainerDatabaseType>,
	schemas?: partialConfigSchemaType[],
};
type partialConfigHostType = Partial<Omit<configHostType, 'databases'>> & {
	databases?: partialConfigDatabaseType[],
};
type partialConfigOptionsType = Partial<configOptionsType>;
type partialConfigType = Partial<Omit<configType, 'options' | 'hosts'>> & {
	options?: partialConfigOptionsType,
	hosts?: partialConfigHostType[],
};

/**
 * Returns a configuration object.
 *
 * @param {string} [filename='config.json'] - The configuration filename.
 * @param {string} [encryptionKey=''] - The encryption key.
 * @returns {configType} - A configuration object.
 */
export function configLoad(filename = 'config.json', encryptionKey = ''): configType {
	const config = jsonLoad<partialConfigType>(filename, encryptionKey);

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
		options: getDefaultOptions(),
		customSelectRepository: {},
		hosts: [],
	};

	if (typeof config !== 'object') {
		throw new Error('The configuration is not an object');
	}

	// options
	if ('options' in config) {
		if (typeof config.options !== 'object') {
			throw new Error('The configuration has no valid property "options"');
		} else {
			newConfig.options = validateOptions(config.options);
		}
	}

	// customm statistics repository
	if ('customSelectRepository' in config) {
		if (typeof config.customSelectRepository !== 'object') {
			throw new Error('The configuration has no valid property "customSelectRepository"');
		} else {
			newConfig.customSelectRepository = validateCustomStats(config.customSelectRepository);
		}
	}

	// hosts
	if (!Array.isArray(config.hosts)) {
		throw new Error('The configuration has no property "hosts" of type array');
	} else {
		newConfig.hosts = config.hosts.map((host, index) => validateHost(host, index));
	}

	// make sure that the host names are unique
	newConfig.hosts.forEach(host => {
		if (newConfig.hosts.filter(e => e.name === host.name).length > 1) {
			throw new Error(`The host name "${host.name}" is used multiple times`);
		}
	});

	// make sure that all the customstatistics can be referenced
	newConfig.hosts.forEach(host => {
		host.databases.forEach(database => {
			if (database.customSelect.length > 0 && typeof newConfig.customSelectRepository[database.customSelect] !== 'object') throw new Error(`The custom statistics configuration "${database.customSelect}" used in host "${host.name}" and database "${database.name}"`);
			database.schemas.forEach(schema => {
				if (schema.customSelect.length > 0 && typeof newConfig.customSelectRepository[schema.customSelect] !== 'object') throw new Error(`The custom statistics configuration "${schema.customSelect}" used in host "${host.name}", database "${database.name}" and schema "${schema.name}" cannot be found`);
			});
		});
	});

	return newConfig;
}

/*
*	validateOptions
*/
function validateOptions(options: partialConfigOptionsType): configOptionsType {
	const newOptions = getDefaultOptions();

	// port
	if ('http_port' in options) {
		if (!isInteger(options.http_port) || options.http_port <= 0 || options.http_port > 65536) {
			throw new Error('The configuration has no valid property "options.http_port"');
		} else {
			newOptions.http_port = options.http_port;
		}
	}

	// pollingSeconds
	if ('pollingSeconds' in options) {
		if (!isInteger(options.pollingSeconds) || options.pollingSeconds <= 0) {
			throw new Error('The configuration has no valid property "options.pollingSeconds"');
		} else {
			newOptions.pollingSeconds = options.pollingSeconds;
		}
	}

	// hidePasswords
	if ('hidePasswords' in options) {
		if (typeof options.hidePasswords !== 'boolean') {
			throw new Error('The configuration has no valid property "options.hidePasswords"');
		} else {
			newOptions.hidePasswords = options.hidePasswords;
		}
	}

	// connectTimeoutSeconds
	if ('connectTimeoutSeconds' in options) {
		if (!isInteger(options.connectTimeoutSeconds) || options.connectTimeoutSeconds < 0) {
			throw new Error('The configuration has no valid property "options.connectTimeoutSeconds"');
		} else {
			newOptions.connectTimeoutSeconds = options.connectTimeoutSeconds;
		}
	}

	return newOptions;
}

/*
*	validateCustomStats
*/
function validateCustomStats(stats: configCustomRepository): configCustomRepository {
	for (const name in stats) {
		const confs = stats[name];

		confs.forEach((conf, index) => {
			const errorLocation = `customStats[${name}][${index}]`;

			if (typeof conf.title !== 'string' || conf.title.length === 0) {
				throw new Error(`"title" must be a non-empty string: "${errorLocation}"`);
			}
			if (typeof conf.sql !== 'string' || conf.sql.length === 0) {
				throw new Error(`"sql" must be a non-empty string: "${errorLocation}"`);
			}
		});
	}

	return stats;
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
			throw new Error(`"enabled" must be a boolean: "${hostErrorLocation}"`);
		} else {
			newHost.enabled = host.enabled;
		}
	}

	// name
	if (typeof host.name !== 'string' || host.name.length === 0) {
		throw new Error(`"name" must be a non-empty string: "${hostErrorLocation}"`);
	} else {
		newHost.name = host.name;
	}

	// host
	if (typeof host.address !== 'string' || host.address.length === 0) {
		throw new Error(`"address" must be a non-empty string: "${hostErrorLocation}"`);
	} else {
		newHost.address = host.address;
	}

	// probe
	if ('probe' in host) {
		if (typeof host.probe !== 'boolean') {
			throw new Error(`"probe" must be a boolean: "${hostErrorLocation}"`);
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
		comment: '',
		name: '',
		port: 1521,
		service: '',
		username: '',
		password: '',
		customSelect: '',
		containerDatabase: null,
		schemas: [],
	
	};

	const databaseErrorLocation = `${hostErrorLocation}.databases[${databaseIndex}]`;

	// enabled
	if ('enabled' in database) {
		if (typeof database.enabled !== 'boolean') {
			throw new Error(`"enabled" must be a boolean: "${databaseErrorLocation}"`);
		} else {
			newDatabase.enabled = database.enabled;
		}
	}

	// comment
	if ('comment' in database) {
		if (typeof database.comment !== 'string') {
			throw new Error(`"comment" must be a string: "${databaseErrorLocation}"`);
		} else {
			newDatabase.comment = database.comment;
		}
	}

	// name
	if (typeof database.name !== 'string' || database.name.length === 0) {
		throw new Error(`"name" must be a non-empty string: "${databaseErrorLocation}"`);
	} else {
		newDatabase.name = database.name;
	}

	// port
	if ('port' in database) {
		if (!isInteger(database.port) || database.port <= 0 || database.port > 65536) {
			throw new Error(`"port" must be an integer between 1 and 65536: "${databaseErrorLocation}"`);
		} else {
			newDatabase.port = database.port;
		}
	}

	// service
	if (typeof database.service !== 'string' || database.service.length === 0) {
		throw new Error(`"service" must be a non-empty string: "${databaseErrorLocation}"`);
	} else {
		newDatabase.service = database.service;
	}

	// username
	if (typeof database.username !== 'string' || database.username.length === 0) {
		throw new Error(`"username" must be a non-empty string: "${databaseErrorLocation}"`);
	} else {
		newDatabase.username = database.username;
	}

	// password
	if (typeof database.password !== 'string' || database.password.length === 0) {
		throw new Error(`"password" must be a non-empty string: "${databaseErrorLocation}"`);
	} else {
		newDatabase.password = database.password;
	}

	// customStats
	if ('customSelect' in database) {
		if (typeof database.customSelect !== 'string' || database.customSelect.length === 0) {
			throw new Error(`"customStats" must be a non-empty string: "${databaseErrorLocation}"`);
		} else {
			newDatabase.customSelect = database.customSelect;
		}
	}

	// containerDatabase
	if ('containerDatabase' in database) {
		if (typeof database.containerDatabase !== 'object') {
			throw new Error(`"containerDatabase" must be an object: "${databaseErrorLocation}"`);
		}

		const containerDatabaseErrorLocation = `${databaseErrorLocation}.containerDatabase`;
		const {containerDatabase} = database;

		newDatabase.containerDatabase = {
			port: newDatabase.port,
			service: newDatabase.service,
			username: newDatabase.username,
			password: newDatabase.password,
		};

		// port
		if ('port' in containerDatabase) {
			if (!isInteger(containerDatabase.port) || containerDatabase.port <= 0 || containerDatabase.port > 65536) {
				throw new Error(`"port" must be an integer between 1 and 65536: "${containerDatabaseErrorLocation}"`);
			} else {
				newDatabase.containerDatabase.port = containerDatabase.port;
			}
		}

		// service
		if ('service' in containerDatabase) {
			if (typeof containerDatabase.service !== 'string' || containerDatabase.service.length === 0) {
				throw new Error(`"service" must be a non-empty string: "${containerDatabaseErrorLocation}"`);
			} else {
				newDatabase.containerDatabase.service = containerDatabase.service;
			}
		}

		// username
		if ('username' in containerDatabase) {
			if (typeof containerDatabase.username !== 'string' || containerDatabase.username.length === 0) {
				throw new Error(`"username" must be a non-empty string: "${containerDatabaseErrorLocation}"`);
			} else {
				newDatabase.containerDatabase.username = containerDatabase.username;
			}
		}

		// password
		if ('password' in containerDatabase) {
			if (typeof containerDatabase.password !== 'string' || containerDatabase.password.length === 0) {
				throw new Error(`"password" must be a non-empty string: "${containerDatabaseErrorLocation}"`);
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
		comment: '',
		name: '',
		username: '',
		password: '',
		customSelect: '',
	};

	// enabled
	if ('enabled' in schema) {
		if (typeof schema.enabled !== 'boolean') {
			throw new Error(`"enabled" must be a boolean: "${schemaErrorLocation}"`);
		} else {
			newSchema.enabled = schema.enabled;
		}
	}

	// comment
	if ('comment' in schema) {
		if (typeof schema.comment !== 'string') {
			throw new Error(`"comment" must be a string: "${schemaErrorLocation}"`);
		} else {
			newSchema.comment = schema.comment;
		}
	}

	// name
	if (typeof schema.name !== 'string' || schema.name.length === 0) {
		throw new Error(`"name" must be a non-empty string: "${schemaErrorLocation}"`);
	} else {
		newSchema.name = schema.name;
	}

	// username
	if (typeof schema.username !== 'string' || schema.username.length === 0) {
		throw new Error(`"username" must be a non-empty string: "${schemaErrorLocation}"`);
	} else {
		newSchema.username = schema.username;
	}

	// password
	if (typeof schema.password !== 'string' || schema.password.length === 0) {
		throw new Error(`"password" must be a non-empty string: "${schemaErrorLocation}"`);
	} else {
		newSchema.password = schema.password;
	}

	// customStats
	if ('customSelect' in schema) {
		if (typeof schema.customSelect !== 'string' || schema.customSelect.length === 0) {
			throw new Error(`"customStats" must be a non-empty string: "${databaseErrorLocation}"`);
		} else {
			newSchema.customSelect = schema.customSelect;
		}
	}

	return newSchema;
}

/*
 * get default options.
 */
function getDefaultOptions(): configOptionsType {
	return {
		http_port: 80,
		pollingSeconds: 60,
		hidePasswords: false,
		connectTimeoutSeconds: 5,
	};
}
