import {jsonLoad} from './files.js';
import {isInteger} from './util.js';

/**
 * Database configuration object.
 */
export type databaseConfigType = {
	name: string,
	connection: string,
	username: string,
	password: string,
};

/**
 * Configuration object.
 */
export type configType = {
	port: number,
	pollingSeconds: number,
	databases: Array<databaseConfigType>,
};

/**
 * Returns a configuration object.
 *
 * @param {string} [filename='config.json'] - The configuration filename.
 * @returns {configType} - A configuration object.
 */
export function configLoad(filename = 'config.json'): configType {
	const config = jsonLoad<configType>(filename);

	return validate(config);
}

/*
 * Validates and returns a configuration object.
 */
function validate(config: configType): configType {
	// port
	if ('port' in config) {
		if (!isInteger(config.port) || config.port <= 0 || config.port > 65536) {
			throw new Error('The configuration has an no valid property "port"');
		}
	} else {
		config.port = 8080;
	}

	// pollingSeconds
	if ('pollingSeconds' in config) {
		if (!isInteger(config.pollingSeconds) || config.pollingSeconds <= 0) {
			throw new Error('The configuration has an no valid property "pollingSeconds"');
		}
	} else {
		config.pollingSeconds = 60;
	}

	// database
	if (!Array.isArray(config.databases)) {
		throw new Error('The configuration has no property "databases" of type array');
	}
	config.databases.forEach((database, index) => {
		['name', 'connection', 'username', 'password'].forEach(propName => {
			if (typeof database[propName] !== 'string' || database[propName].length === 0) {
				throw new Error(`The configuration has an invalid "${propName}" property in "databases[${index}]"`);
			}
		});
	});

	return config;
}
