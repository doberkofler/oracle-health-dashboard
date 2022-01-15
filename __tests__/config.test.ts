import {configLoad, validateConfig} from '../src/config.js';
import type {configType} from '../src/config.js';

describe('configLoad', () => {
	it('loads the configuration and returns a validated configuration object or throws an error', () => {
		expect(() => configLoad()).not.toThrow();
		expect(configLoad('./__tests__/config.test.json')).toStrictEqual({http_port: 80, pollingSeconds: 60, pollSchema: true, databases: []});
	});
});

describe('validateConfig', () => {
	it('returns a validated configuration object', () => {
		expect(validateConfig({
			hosts: [],
		})).toStrictEqual({http_port: 80, pollingSeconds: 60, pollSchema: true, databases: []});

		expect(validateConfig({
			http_port: 9090,
			pollingSeconds: 90,
			hosts: [],
		})).toStrictEqual({http_port: 9090, pollingSeconds: 90, pollSchema: true, databases: []});

		expect(validateConfig({
			hosts: [{
				enabled: true,
				name: 'name',
				host: '127.0.0.1',
				databases: [],
			}]
		})).toStrictEqual({http_port: 80, pollingSeconds: 60, pollSchema: true, databases: []});

		expect(validateConfig({
			hosts: [{
				enabled: true,
				name: 'host_name',
				host: '127.0.0.1',
				databases: [{
					enabled: true,
					name: 'database_name',
					port: 1521,
					service: 'database_service',
					username: 'database_username',
					password: 'database_password',
					containerDatabase: {
						service: 'container_service',
						username: 'container_username',
						password: 'container_password',
					},
					schemas: [{
						enabled: true,
						name: 'schema_name',
						username: 'schema_username',
						password: 'schema_password',
					}],
				
				}],
			}]
		})).toStrictEqual({
			http_port: 80, pollingSeconds: 60, pollSchema: true, databases: [{
				id: 1,
				hostName: 'host_name',
				databaseName: 'database_name',
				cdbConnect: {
					connection: '127.0.0.1:1521/container_service',
					username: 'container_username',
					password: 'container_password',
				},
				pdbConnect: {
					connection: '127.0.0.1:1521/database_service',
					username: 'database_username',
					password: 'database_password',
				},
				schemas: [{
					schemaName: 'schema_name',
					schemaConnect: {
						connection: '127.0.0.1:1521/database_service',
						username: 'schema_username',
						password: 'schema_password',
					},
					enabled: true,
				}],
				enabled: true,
			}]
		});
	});

	it('throws an error when the configuration is invalid', () => {
		const tests: [object, string][] = [
			[{hosts: [], http_port: ''}, 'The configuration has no valid property "port"'],
			[{hosts: [], pollingSeconds: ''}, 'The configuration has no valid property "pollingSeconds"'],
			[{hosts: [], pollSchema: ''}, 'The configuration has no valid property "pollSchema"'],
			[{hosts: ''}, 'The configuration has no property "hosts" of type array'],
			[{hosts: [{name: ''}]}, '"name" must be non-empty string: "hosts[0]"'],
			[{hosts: [{name: 'n', host: '', databases: []}]}, '"host" must be non-empty string: "hosts[0]"'],
			[{hosts: [{name: 'n', host: 'h', databases: ''}]}, '"databases" must be an array: "hosts[0]"'],
			[{hosts: [{name: 'n', host: 'h', databases: [{enabled: ''}]}]}, '"enabled" must be boolean: "hosts[0].databases[0]"'],
			[{hosts: [{name: 'n', host: 'h', databases: [{enabled: true, name: ''}]}]}, '"name" must be non-empty string: "hosts[0].databases[0]"'],
			[{hosts: [{name: 'n', host: 'h', databases: [{enabled: true, name: 'n', port: ''}]}]}, '"port" must be integer between 1 and 65536: "hosts[0].databases[0]"'],
			[{hosts: [{name: 'n', host: 'h', databases: [{enabled: true, name: 'n', port: 1, service: ''}]}]}, '"service" must be non-empty string: "hosts[0].databases[0]"'],
			[{hosts: [{name: 'n', host: 'h', databases: [{enabled: true, name: 'n', port: 1, service: 's', username: ''}]}]}, '"username" must be non-empty string: "hosts[0].databases[0]"'],
			[{hosts: [{name: 'n', host: 'h', databases: [{enabled: true, name: 'n', port: 1, service: 's', username: 'u', password: ''}]}]}, '"password" must be non-empty string: "hosts[0].databases[0]"'],
			[{hosts: [{name: 'n', host: 'h', databases: [{enabled: true, name: 'n', port: 1, service: 's', username: 'u', password: 'p'}]}]}, '"schemas" must be an array: "hosts[0].databases[0]"'],

			/*
			containerDatabase?: externConfigContainerDatabaseType,
			schemas: externConfigSchemaType[],
			*/


			/*
			[{hosts: [{name: 'n', host: 'h', databases: 'u', password: ''}]}, 'The configuration has an invalid "password" property in cdb with index "0"'],
			[{hosts: [{name: 'n', host: 'h', databases: 'u', password: 'p', pdb: 'pdb'}]}, 'The configuration has an invalid "pdb" property in cdb with index "0"'],
			[{hosts: [{name: 'n', host: 'h', databases: 'u', password: 'p', pdb: [{name: '', connection: 'c', username: 'u', password: 'p'}]}]}, 'The configuration has an invalid "name" property in pdb with index "0" of cdb with name "n"'],
			[{hosts: [{name: 'n', host: 'h', databases: 'u', password: 'p', pdb: [{name: 'n', connection: '', username: 'u', password: 'p'}]}]}, 'The configuration has an invalid "connection" property in pdb with index "0" of cdb with name "n"'],
			[{hosts: [{name: 'n', host: 'h', databases: 'u', password: 'p', pdb: [{name: 'n', connection: 'c', username: '', password: 'p'}]}]}, 'The configuration has an invalid "username" property in pdb with index "0" of cdb with name "n"'],
			[{hosts: [{name: 'n', host: 'h', databases: 'u', password: 'p', pdb: [{name: 'n', connection: 'c', username: 'u', password: ''}]}]}, 'The configuration has an invalid "password" property in pdb with index "0" of cdb with name "n"'],
			*/
		];
		
		tests.forEach(test => {
			expect(() => validateConfig(test[0] as unknown as configType)).toThrow(test[1]);
		});
	});
});
