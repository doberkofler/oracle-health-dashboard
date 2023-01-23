import debugModule from 'debug';
import oracledb from 'oracledb';
import {probe} from '../util/probe';
import {connect, disconnect, execute, getPlaceholder} from './oracle';
import {getStatus} from './worker';
import {statsInitial} from '../statsStore';
import {getConnectionDatabase} from '../config/connection';
import {getFlat} from '../config/flatten';
import {write, writeNewLine, writeStartingOnColumn} from '../util/tty';
import {z$staticMetricType} from '../types';
import {prettyFormat} from '../util/util';

import type {configType, flatType, statsInitType, statusType} from '../types';
import type {connectionFlagsType} from '../config/connection';

const debug = debugModule('oracle-health-dashboard:databaseInitial');

export type initialGatherType = statsInitType & {
	status: statusType,
};

const bndInitial = [
	{
		id: 'oracle_version',
		type: oracledb.STRING,
	},
	{
		id: 'oracle_platform',
		type: oracledb.STRING,
	},
	{
		id: 'oracle_log_mode',
		type: oracledb.STRING,
	},
	{
		id: 'oracle_database_character_set',
		type: oracledb.STRING,
	},
	{
		id: 'oracle_sga_target',
		type: oracledb.STRING,
	},
	{
		id: 'oracle_pga_aggregate_target',
		type: oracledb.STRING,
	},
];

const sqlInitial = `
BEGIN
	-- oracle version
	SELECT version INTO :${getPlaceholder('oracle_version', bndInitial)} FROM v$instance;

	-- oracle platform
	:${getPlaceholder('oracle_platform', bndInitial)} := dbms_utility.port_string();

	-- oracle archive logging active
	SELECT log_mode INTO :${getPlaceholder('oracle_log_mode', bndInitial)} FROM v$database;

	-- oracle database character set
	SELECT value INTO :${getPlaceholder('oracle_database_character_set', bndInitial)} FROM nls_database_parameters WHERE parameter = 'NLS_CHARACTERSET';

	-- oracle sga_target
	SELECT  value INTO :${getPlaceholder('oracle_sga_target', bndInitial)} FROM v$parameter WHERE name = 'sga_target';

	-- oracle pga_aggregate_target
	SELECT  value INTO :${getPlaceholder('oracle_pga_aggregate_target', bndInitial)} FROM v$parameter WHERE name = 'pga_aggregate_target';
END;`;

/*
 * get statistics for database
 */
const gatherInitialize = async (flat: flatType, connectionFlags: connectionFlagsType): Promise<initialGatherType> => {
	const connectionOptions = getConnectionDatabase(flat, connectionFlags);
	const title = `[${new Date().toJSON()}] Gathering initial data with database "${flat.database.name}" as "${connectionOptions.username}" using "${connectionOptions.connectionString}"`;

	write(`\n${title}`);

	const data: initialGatherType = {
		hostName: flat.host.name,
		databaseName: flat.database.name,
		schemaName: '',
		status: getStatus(true),
		static: {
			oracle_version: '',
			oracle_platform: '',
			oracle_log_mode: '',
			oracle_database_character_set: '',
			oracle_sga_target: '',
			oracle_pga_aggregate_target: '',
		}
	};

	// probe the host
	if (flat.host.probe) {
		writeStartingOnColumn(' - probing ...', title.length);
		const hostAlive = await probe(flat.host.address);
		if (!hostAlive) {
			const message = 'host not alive';
			writeStartingOnColumn(` - ${message}`, title.length);
			data.status = getStatus(false, message);
			return data;
		}
	}

	// connect
	writeStartingOnColumn(' - connecting ...', title.length);
	const connection = await connect(connectionOptions);
	if (typeof connection === 'string') {
		writeStartingOnColumn(' - error', title.length);
		data.status = getStatus(false, connection);
		return data;
	}

	// execute
	const info = z$staticMetricType.parse(await execute(connection, sqlInitial, bndInitial));
	if (typeof info === 'string') {
		writeStartingOnColumn(' - cannot execute', title.length);
		data.status = getStatus(false, info);
		return data;
	}

	// disconnect
	const result = disconnect(connection, connectionOptions);
	if (typeof result === 'string') {
		writeStartingOnColumn(' - cannot disconnect', title.length);
		data.status = getStatus(false, result);
		return data;
	}

	writeStartingOnColumn(' - success', title.length);

	data.static = info;

	return data;
};

/**
 * Initialize statistics gathering.
 *
 * @param config - The configuration object.
 * @returns A promise that resolves when done.
 */
export const gathererInitial = async (config: configType): Promise<void> => {
	debug('gathererInitial', config);

	// prepare promises
	const gather = [] as flatType[];
	config.hosts.forEach(host => {
		host.databases.forEach(database => {
			gather.push(getFlat(host, database));
		});
	});

	// process promises
	const stats  = [] as statsInitType[];
	for (const e of gather) {
		const result = await gatherInitialize(e, {
			includePassword: true,
			connectTimeoutSeconds: config.options.connectTimeoutSeconds,
		});
		stats.push(result);
	}

	writeNewLine();

	debug('stats', prettyFormat(stats));

	statsInitial(stats);
};
