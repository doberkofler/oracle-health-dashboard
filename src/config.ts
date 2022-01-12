import {jsonLoad} from './util/files.js';
import {isInteger} from './util/util.js';
import type {connectionOptionsType} from './gatherer/oracle';

/**
 * PDB configuration object.
 */
export type pdbConfigType = connectionOptionsType & {
	enabled?: boolean,
};

/**
 * CDB configuration object.
 */
export type cdbConfigType = connectionOptionsType & {
	enabled?: boolean,
	pdb?: Array<pdbConfigType>,
};

/**
 * Configuration object.
 */
export type configType = {
	http_port: number,
	pollingSeconds: number,
	cdb: Array<cdbConfigType>,
};

/**
 * Returns a configuration object.
 *
 * @param {string} [filename='config.json'] - The configuration filename.
 * @returns {configType} - A configuration object.
 */
export function configLoad(filename = 'config.json'): configType {
	const config = jsonLoad<configType>(filename);

	return validateConfig(config);
}

/*
 * Validates and returns a configuration object.
 *
 * @param {configType} config - - The configuration object.
 * @returns {configType} - The validated configuration object.
 */
export function validateConfig(config: Partial<configType>): configType {
	// port
	if ('http_port' in config) {
		if (!isInteger(config.http_port) || config.http_port <= 0 || config.http_port > 65536) {
			throw new Error('The configuration has an no valid property "port"');
		}
	} else {
		config.http_port = 80;
	}

	// pollingSeconds
	if ('pollingSeconds' in config) {
		if (!isInteger(config.pollingSeconds) || config.pollingSeconds <= 0) {
			throw new Error('The configuration has an no valid property "pollingSeconds"');
		}
	} else {
		config.pollingSeconds = 60;
	}

	// CDB's
	if (!Array.isArray(config.cdb)) {
		throw new Error('The configuration has no property "cdb" of type array');
	} else {
		config.cdb = config.cdb.map(validateCDB);
	}

	return config as configType;
}

/*
 * Validates and returns a CDB object.
 */
function validateCDB(cdb: cdbConfigType, index: number): cdbConfigType {
	['name', 'connection', 'username', 'password'].forEach(propName => {
		const value = cdb[propName as keyof cdbConfigType];

		if (typeof value !== 'string' || value.length === 0) {
			throw new Error(`The configuration has an invalid "${propName}" property in cdb with index "${index}"`);
		}
	});

	if ('enabled' in cdb) {
		if (typeof cdb.enabled !== 'boolean') {
			throw new Error(`The configuration has an invalid "enabled" property in cdb with index "${index}"`);
		}
	} else {
		cdb.enabled = true;
	}

	if ('pdb' in cdb) {
		if (!Array.isArray(cdb.pdb)) {
			throw new Error(`The configuration has an invalid "pdb" property in cdb with index "${index}"`);
		} else {
			cdb.pdb = cdb.pdb.map(validatePDB.bind(null, cdb));
		}
	}

	return cdb;
}

/*
 * Validates and returns a PDB object.
 */
function validatePDB(cdb: cdbConfigType, pdb: pdbConfigType, index: number): pdbConfigType {
	['name', 'connection', 'username', 'password'].forEach(propName => {
		const value = pdb[propName as keyof pdbConfigType];

		if (typeof value !== 'string' || value.length === 0) {
			throw new Error(`The configuration has an invalid "${propName}" property in pdb with index "${index}" of cdb with name "${cdb.name}"`);
		}
	});

	if ('enabled' in pdb) {
		if (typeof pdb.enabled !== 'boolean') {
			throw new Error(`The configuration has an invalid "enabled" property in pdb with index "${index}" of cdb with name "${cdb.name}"`);
		}
	} else {
		pdb.enabled = true;
	}

	return pdb;
}
