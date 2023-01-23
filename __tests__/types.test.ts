/* eslint-disable @typescript-eslint/no-confusing-void-expression */

import {
	z$sqlCdbType,
	z$sqlPdbType,
	z$sqlCdpAndPdbType,
	z$metricType,
	z$statusType,
	z$statsSchemaType,
	z$statsInitType,
	z$statsAddDataType,
} from '../src/types';

const now = new Date();

const dataCdb = {
	server_date: now,
	host_cpu_utilization: 1,
	io_requests_per_second: 2,
	buffer_cache_hit_ratio: 3,
	executions_per_sec: 4,
};
const dataCdbNull = {
	server_date: now,
	host_cpu_utilization: 1,
	io_requests_per_second: 2,
	buffer_cache_hit_ratio: 3,
	executions_per_sec: 4,
};
const dataPdb = {
	no_of_sessions: 5,
	flashback_percentage: 6,
	last_successful_rman_backup_date_full_db: now,
	last_successful_rman_backup_date_archive_log: now,
	last_rman_backup_date_full_db: now,
	last_rman_backup_date_archive_log: now,
};
const dataPdbNull = {
	no_of_sessions: null,
	flashback_percentage: null,
	last_successful_rman_backup_date_full_db: null,
	last_successful_rman_backup_date_archive_log: null,
	last_rman_backup_date_full_db: null,
	last_rman_backup_date_archive_log: null,
};
const dataStaticMetrict = {
	oracle_version: 'oracle_version',
	oracle_platform: 'oracle_platform',
	oracle_log_mode: 'oracle_log_mode',
	oracle_database_character_set: 'oracle_database_character_set',
	oracle_sga_target: 'oracle_sga_target',
	oracle_pga_aggregate_target: 'oracle_pga_aggregate_target',
};

const dataStatus = {
	timestamp: now,
	success: true,
	message: 'message',
};
const dataCustom = [{
	title: 'title',
	value: 'value',
}];
const dataSchema = {
	schemaName: 'schemaName',
	status: dataStatus,
	custom: dataCustom,
};

describe('types', () => {
	it('z$sqlCdbType', () => {
		[
			dataCdb,
			dataCdbNull,
		].forEach(data => expect(z$sqlCdbType.safeParse(data)).toStrictEqual({success: true, data}));
	});

	it('z$sqlPdbType', () => {
		[
			dataPdb,
			dataPdbNull,
		].forEach(data => expect(z$sqlPdbType.safeParse(data)).toStrictEqual({success: true, data}));
	});

	it('z$sqlCdpAndPdbType', () => {
		[
			{...dataCdb, ...dataPdb},
			{...dataCdbNull, ...dataPdbNull},
		].forEach(data => expect(z$sqlCdpAndPdbType.safeParse(data)).toStrictEqual({success: true, data}));
	});

	it('z$metricType', () => {
		[
			{...dataCdb, ...dataPdb, custom: dataCustom},
			{...dataCdb, ...dataPdb, custom: []},
		].forEach(data => expect(z$metricType.safeParse(data)).toStrictEqual({success: true, data}));
	});

	it('z$statusType', () => {
		[
			dataStatus,
		].forEach(data => expect(z$statusType.safeParse(data)).toStrictEqual({success: true, data}));
	});

	it('z$statsSchemaType', () => {
		[
			dataSchema,
		].forEach(data => expect(z$statsSchemaType.safeParse(data)).toStrictEqual({success: true, data}));
	});

	it('z$statsInitType', () => {
		[
			{
				hostName: 'hostName',
				databaseName: 'databaseName',
				schemaName: 'schemaName',
				status: dataStatus,
				static: dataStaticMetrict,
			},
		].forEach(data => expect(z$statsInitType.safeParse(data)).toStrictEqual({success: true, data}));
	});

	it('z$statsAddDataType', () => {
		[
			{
				hostName: 'hostName',
				databaseName: 'databaseName',
				status: dataStatus,
				metric: {...dataCdb, ...dataPdb, custom: dataCustom},
				schemas: [dataSchema],
			
			},
			{
				hostName: 'hostName',
				databaseName: 'databaseName',
				status: dataStatus,
				metric: {...dataCdbNull, ...dataPdbNull, custom: []},
				schemas: [],
			
			},
		].forEach(data => expect(z$statsAddDataType.safeParse(data)).toStrictEqual({success: true, data}));
	});
});
