// types used for the configuration
export type configSchemaType = {
	enabled: boolean,
	name: string,
	comment: string,
	username: string,
	password: string,
	customSelect: string,
};

export type configContainerDatabaseType = {
	port: number,
	service: string,
	username: string,
	password: string,
};
export type configDatabaseType = {
	enabled: boolean,
	comment: string,
	name: string,
	port: number,
	service: string,
	username: string,
	password: string,
	customSelect: string,
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

export type configCustomStatType = {
	title: string,
	sql: string,
};
export type configCustomStatsType = configCustomStatType[];
export type configCustomRepository = Record<string, configCustomStatsType>;

export type configOptionsType = {
	http_port: number,
	pollingSeconds: number,
	hidePasswords: boolean,
	connectTimeoutSeconds: number,
};

export type configType = {
	options: configOptionsType,
	customSelectRepository: configCustomRepository,
	hosts: configHostType[],
};

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
