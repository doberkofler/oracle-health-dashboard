import {statsInitial, statsAdd, statsLoad} from '../src/statsStore';
import {jsonLoad, jsonSave} from '../src/util/files.js';
import fs from 'fs';

const FILENAME = 'db.json';

describe('statsInitial', () => {
	it('initializes the statistics database', () => {
		statsInitial([{
			hostName: 'host',
			databaseName: 'database',
			schemaName: '',
			statics: {
				oracle_version: '',
				oracle_platform: '',
				oracle_log_mode: '',
				oracle_database_character_set: '',
				oracle_sga_target: '',
				oracle_pga_aggregate_target: '',
			},
		}]);

		const stats = jsonLoad(FILENAME);
		expect(stats).toStrictEqual({
			magic: 'MAGIC',
			version: 1,
			hosts: [{
				name: 'host',
				databases: [{
					name: 'database',
					statics: {
						oracle_version: '',
						oracle_platform: '',
						oracle_log_mode: '',
						oracle_database_character_set: '',
						oracle_sga_target: '',
						oracle_pga_aggregate_target: '',
					},
					metrics: [],
				}],
			}],
		});
	});
});

describe('statsLoad', () => {
	it('loads the statistics from the database', () => {
		statsInitial([{
			hostName: 'host',
			databaseName: 'database',
			schemaName: '',
			statics: {
				oracle_version: '',
				oracle_platform: '',
				oracle_log_mode: '',
				oracle_database_character_set: '',
				oracle_sga_target: '',
				oracle_pga_aggregate_target: '',
			},
		}]);

		const stats = statsLoad();
		expect(stats).toStrictEqual([{
			name: 'host',
			databases: [{
				name: 'database',
				statics: {
					oracle_version: '',
					oracle_platform: '',
					oracle_log_mode: '',
					oracle_database_character_set: '',
					oracle_sga_target: '',
					oracle_pga_aggregate_target: '',
				},
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
		const NOW = new Date();

		const status = {
			timestamp: NOW,
			success: true,
			message: '',
		};

		const statics = {
			oracle_version: 'oracle_version',
			oracle_platform: 'oracle_platform',
			oracle_log_mode: 'oracle_log_mode',
			oracle_database_character_set: 'oracle_log_mode',
			oracle_sga_target: 'oracle_sga_target',
			oracle_pga_aggregate_target: 'oracle_pga_aggregate_target',
		};

		const metric = {
			server_date: NOW,
			host_cpu_utilization: 1,
			io_requests_per_second: 2,
			buffer_cache_hit_ratio: 3,
			executions_per_sec: 4,
			no_of_sessions: 5,
			flashback_percentage: 6,
			last_successful_rman_backup_date_full_db: NOW,
			last_successful_rman_backup_date_archive_log: NOW,
			last_rman_backup_date_full_db: NOW,
			last_rman_backup_date_archive_log: NOW,
			custom: [],
		};

		statsInitial([{
			hostName: 'host',
			databaseName: 'database',
			schemaName: '',
			statics,
		}]);

		statsAdd([{
			hostName: 'host',
			databaseName: 'database',
			schemaName: '',
			status,
			metric,
			schemas: [],
		}]);

		const stats = statsLoad();
		expect(stats).toStrictEqual([{
			name: 'host',
			databases: [{
				name: 'database',
				statics,
				metrics: [Object.assign({}, metric, {status, schemas: []})],
			}],
		}]);
	});

	it('throws an error when a wrong "id" is given', () => {
		const NOW = new Date();

		const status = {
			timestamp: NOW,
			success: true,
			message: '',
		};

		const statics = {
			oracle_version: 'oracle_version',
			oracle_platform: 'oracle_platform',
			oracle_log_mode: 'oracle_log_mode',
			oracle_database_character_set: 'oracle_log_mode',
			oracle_sga_target: 'oracle_sga_target',
			oracle_pga_aggregate_target: 'oracle_pga_aggregate_target',
		};

		const metric = {
			server_date: NOW,
			host_cpu_utilization: 1,
			io_requests_per_second: 2,
			buffer_cache_hit_ratio: 3,
			executions_per_sec: 4,
			no_of_sessions: 5,
			flashback_percentage: 6,
			last_successful_rman_backup_date_full_db: NOW,
			last_successful_rman_backup_date_archive_log: NOW,
			last_rman_backup_date_full_db: NOW,
			last_rman_backup_date_archive_log: NOW,
			custom: [],
		};

		statsInitial([{
			hostName: 'host',
			databaseName: 'database',
			schemaName: '',
			statics,
		}]);

		expect(() => {
			statsAdd([{
				hostName: 'host',
				databaseName: 'Tatabase',
				schemaName: '',
				status,
				metric,
				schemas: [],
			}]);
		}).toThrow();
	});
});
