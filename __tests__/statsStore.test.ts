import {statsInitial, statsAdd, statsLoad} from '../src/statsStore';
import {jsonLoad, jsonSave} from '../src/util/files';
import fs from 'fs';

const FILENAME = 'db.json';

const now = new Date();

const status = {
	timestamp: now,
	success: true,
	message: '',
};

const dataStatic = {
	oracle_version: 'oracle_version',
	oracle_platform: 'oracle_platform',
	oracle_log_mode: 'oracle_log_mode',
	oracle_database_character_set: 'oracle_log_mode',
	oracle_sga_target: 'oracle_sga_target',
	oracle_pga_aggregate_target: 'oracle_pga_aggregate_target',
};

const dataMetric = {
	server_date: now,
	host_cpu_utilization: 1,
	io_requests_per_second: 2,
	buffer_cache_hit_ratio: 3,
	executions_per_sec: 4,
	no_of_sessions: 5,
	flashback_percentage: 6,
	last_successful_rman_backup_date_full_db: now,
	last_successful_rman_backup_date_archive_log: now,
	last_rman_backup_date_full_db: now,
	last_rman_backup_date_archive_log: now,
	custom: [],
};

describe('statsInitial', () => {
	it('initializes the statistics database', () => {
		statsInitial([{
			hostName: 'hostName',
			databaseName: 'databaseName',
			schemaName: 'schemaName',
			static: dataStatic,
		}]);

		const stats = jsonLoad(FILENAME);
		expect(stats).toStrictEqual({
			magic: 'MAGIC',
			version: 1,
			hosts: [{
				hostName: 'hostName',
				databases: [{
					databaseName: 'databaseName',
					static: dataStatic,
					metrics: [],
				}],
			}],
		});
	});
});

describe('statsLoad', () => {
	it('loads the statistics from the database', () => {
		statsInitial([{
			hostName: 'hostName',
			databaseName: 'databaseName',
			schemaName: '',
			static: dataStatic,
		}]);

		const stats = statsLoad();
		expect(stats).toStrictEqual([{
			hostName: 'hostName',
			databases: [{
				databaseName: 'databaseName',
				static: dataStatic,
				metrics: [],
			}],
		}]);
	});

	it('throw error when file is missing', () => {
		fs.unlinkSync(FILENAME);

		expect(() => {
			statsLoad();
		}).toThrow(`Statistics database in file "${FILENAME}" not found.`);
	});

	it('throw error when magic is missing', () => {
		jsonSave(FILENAME, {
			magic: 'magic',
			version: 1,
			databases: [],
		});
	
		expect(() => {
			statsLoad();
		}).toThrow();
	});

	it('throw error when version is wrong', () => {
		jsonSave(FILENAME, {
			magic: 'MAGIC',
			version: 0,
			databases: [],
		});
	
		expect(() => {
			statsLoad();
		}).toThrow();
	});
});

describe('statsAdd', () => {
	it('add metrics to the statistics in the database', () => {
		statsInitial([{
			hostName: 'hostName',
			databaseName: 'databaseName',
			schemaName: '',
			static: dataStatic,
		}]);

		statsAdd([{
			hostName: 'hostName',
			databaseName: 'databaseName',
			status,
			metric: dataMetric,
			schemas: [],
		}]);

		const stats = statsLoad();
		expect(stats).toStrictEqual([{
			hostName: 'hostName',
			databases: [{
				databaseName: 'databaseName',
				static: dataStatic,
				metrics: [Object.assign({}, dataMetric, {status, schemas: []})],
			}],
		}]);
	});

	it('throws an error when a wrong "id" is given', () => {
		statsInitial([{
			hostName: 'hostName',
			databaseName: 'databaseName',
			schemaName: '',
			static: dataStatic,
		}]);

		expect(() => {
			statsAdd([{
				hostName: 'hostName',
				databaseName: 'TatabaseTame',
				status,
				metric: dataMetric,
				schemas: [],
			}]);
		}).toThrow();
	});
});
