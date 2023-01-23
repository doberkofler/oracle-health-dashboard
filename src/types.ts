import {z} from 'zod';

/*
*	configuration
*/
export const z$configSchemaType = z.object({
	enabled: z.boolean(),
	name: z.string(),
	comment: z.string(),
	username: z.string(),
	password: z.string(),
	customSelect: z.string(),
}).strict();
export type configSchemaType = z.infer<typeof z$configSchemaType>;

export const z$configContainerDatabaseType = z.object({
	port: z.number(),
	service: z.string(),
	username: z.string(),
	password: z.string(),
}).strict();
export type configContainerDatabaseType = z.infer<typeof z$configContainerDatabaseType>;

export const z$configDatabaseType = z.object({
	enabled: z.boolean(),
	comment: z.string(),
	name: z.string(),
	port: z.number(),
	service: z.string(),
	username: z.string(),
	password: z.string(),
	customSelect: z.string(),
	containerDatabase: z.nullable(z$configContainerDatabaseType),
	schemas: z.array(z$configSchemaType),
}).strict();
export type configDatabaseType = z.infer<typeof z$configDatabaseType>;

export const z$configHostType = z.object({
	enabled: z.boolean(),
	name: z.string(),
	address: z.string(),
	probe: z.boolean(),
	databases: z.array(z$configDatabaseType),
}).strict();
export type configHostType = z.infer<typeof z$configHostType>;

export const z$configCustomStatType = z.object({
	title: z.string(),
	sql: z.string(),
}).strict();
export type configCustomStatType = z.infer<typeof z$configCustomStatType>;
export const z$configCustomRepository = z.record(z.string().min(1), z.array(z$configCustomStatType));
export type configCustomRepository = z.infer<typeof z$configCustomRepository>;

export const z$configOptionsType = z.object({
	pollingSeconds: z.number(),
	hidePasswords: z.boolean(),
	connectTimeoutSeconds: z.number(),
}).strict();
export type configOptionsType = z.infer<typeof z$configOptionsType>;

export const z$configType = z.object({
	options: z$configOptionsType,
	customSelectRepository: z$configCustomRepository,
	hosts: z.array(z$configHostType),
}).strict();
export type configType = z.infer<typeof z$configType>;

// types without the tree
export type justHostType = Omit<configHostType, 'databases'>;
export type justDatabaseType = Omit<configDatabaseType, 'schemas'>;

// types used when using an individual host/database/schema
export type flatSchemaType = Omit<configSchemaType, 'customSelect'>;
export type flatDatabaseType = Omit<configDatabaseType, 'customStats' | 'customSelect' | 'schemas'>;
export type flatHostType = Omit<configHostType, 'databases'>;
export type flatType = {
	host: flatHostType,
	database: flatDatabaseType,
	schema?: flatSchemaType,
};

/*
*	metrics
*/

export const z$sqlCdbType = z.object({
	server_date: z.nullable(z.date()),
	host_cpu_utilization: z.nullable(z.number()),
	io_requests_per_second: z.nullable(z.number()),
	buffer_cache_hit_ratio: z.nullable(z.number()),
	executions_per_sec: z.nullable(z.number()),
}).strict();
export type sqlCdbType = z.infer<typeof z$sqlCdbType>;

export const z$sqlPdbType = z.object({
	no_of_sessions: z.nullable(z.number()),
	flashback_percentage: z.nullable(z.number()),
	last_successful_rman_backup_date_full_db: z.nullable(z.date()),
	last_successful_rman_backup_date_archive_log: z.nullable(z.date()),
	last_rman_backup_date_full_db: z.nullable(z.date()),
	last_rman_backup_date_archive_log: z.nullable(z.date()),
}).strict();
export type sqlPdbType = z.infer<typeof z$sqlPdbType>;

export const z$statusType = z.object({
	timestamp: z.date(),
	success: z.boolean(),
	message: z.string(),
}).strict();
export type statusType = z.infer<typeof z$statusType>;

export type initialGatherType = {
	status: statusType,
	oracle_version: string,
};

export const z$customStatType = z.object({
	title: z.string(),
	value: z.string(),
}).strict();
export type customStatType = z.infer<typeof z$customStatType>;

export const z$sqlCdpAndPdbType = z$sqlCdbType.merge(z$sqlPdbType);
export const z$metricType =  z$sqlCdpAndPdbType.merge(z.object({
	custom: z.array(z$customStatType),
}).strict());
export type metricType = z.infer<typeof z$metricType>;

export type gatherSchemaType = {
	schemaName: string,
	status: statusType,
	custom: customStatType[],
};

export type gatherDatabaseType = {
	hostName: string,
	databaseName: string,
	status: statusType,
	metric: metricType,
	schemas: gatherSchemaType[],
};

export const z$staticMetricType = z.object({
	oracle_version: z.string(),
	oracle_platform: z.string(),
	oracle_log_mode: z.string(),
	oracle_database_character_set: z.string(),
	oracle_sga_target: z.string(),
	oracle_pga_aggregate_target: z.string(),
}).strict();
export type staticMetricType = z.infer<typeof z$staticMetricType>;

/*
*	stats
*/

export const z$statsInitType = z.object({
	hostName: z.string(),
	databaseName: z.string(),
	schemaName: z.string(),
	static: z$staticMetricType,
	status: z$statusType,
}).strict();
export type statsInitType = z.infer<typeof z$statsInitType>;

export const z$statsSchemaType = z.object({
	schemaName: z.string(),
	status: z$statusType,
	custom: z.array(z$customStatType),
}).strict();
export type statsSchemaType = z.infer<typeof z$statsSchemaType>;

export const z$statsAddDataType = z.object({
	hostName: z.string(),
	databaseName: z.string(),
	status: z$statusType,
	metric: z$metricType,
	schemas: z.array(z$statsSchemaType),
}).strict();
export type statsAddDataType = z.infer<typeof z$statsAddDataType>;

const z$dynamicMetricType = z$metricType.merge(z.object({
	status: z$statusType,
	schemas: z.array(z$statsSchemaType),
})).strict();
export type dynamicMetricType = z.infer<typeof z$dynamicMetricType>;

export const z$statsDatabaseType = z.object({
	databaseName: z.string(),
	static: z.optional(z$staticMetricType),
	metrics: z.array(z$dynamicMetricType),
}).strict();
export type statsDatabaseType = z.infer<typeof z$statsDatabaseType>;

export const z$statsHostType = z.object({
	hostName: z.string(),
	databases: z.array(z$statsDatabaseType),
}).strict();
export type statsHostType = z.infer<typeof z$statsHostType>;

export const z$statsType = z.object({
	magic: z.string(),
	version: z.number(),
	hosts: z.array(z$statsHostType),
}).strict();
export type statsType = z.infer<typeof z$statsType>;
