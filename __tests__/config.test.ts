import {configLoad, validateConfig} from '../src/server/config';

describe('configLoad', () => {
	it('loads the configuration and returns a validated configuration object or throws an error', () => {
		expect(configLoad('./__tests__/config.test.json')).toStrictEqual({
			options: {
				pollingSeconds: 60,
				hidePasswords: false,
				connectTimeoutSeconds: 5,
			},
			customSelectRepository: {},
			hosts: [],
		});
	});
});

describe('validateConfig', () => {
	it('returns a validated configuration object', () => {
		expect(validateConfig({
			hosts: [],
		})).toStrictEqual({
			options: {
				pollingSeconds: 60,
				hidePasswords: false,
				connectTimeoutSeconds: 5,
			},
			customSelectRepository: {},
			hosts: [],
		});

		expect(validateConfig({
			options: {
				pollingSeconds: 90,
			},
			hosts: [],
		})).toStrictEqual({
			options: {
				pollingSeconds: 90,
				hidePasswords: false,
				connectTimeoutSeconds: 5,
			},
			customSelectRepository: {},
			hosts: [],
		});

		expect(validateConfig({
			hosts: [{
				enabled: true,
				name: 'name',
				address: '127.0.0.1',
				databases: [],
			}]
		})).toStrictEqual({
			options: {
				pollingSeconds: 60,
				hidePasswords: false,
				connectTimeoutSeconds: 5,
			},
			customSelectRepository: {},
			hosts: [{
				enabled: true,
				name: 'name',
				address: '127.0.0.1',
				probe: true,
				databases: [],
			}],
		});

		// without container database
		expect(validateConfig({
			customSelectRepository: {
				custom: [{
					title: 'title',
					sql: 'sql',
				}],
			},
			hosts: [{
				enabled: true,
				name: 'host_name',
				address: '127.0.0.1',
				databases: [{
					enabled: true,
					name: 'database_name',
					port: 1521,
					service: 'database_service',
					username: 'database_username',
					password: 'database_password',
					schemas: [],
					customSelect: 'custom',
				}],
			}],
		})).toStrictEqual({
			options: {
				pollingSeconds: 60,
				hidePasswords: false,
				connectTimeoutSeconds: 5,
			},
			customSelectRepository: {
				custom: [{
					title: 'title',
					sql: 'sql',
				}],
			},
			hosts: [{
				enabled: true,
				name: 'host_name',
				address: '127.0.0.1',
				probe: true,
				databases: [{
					enabled: true,
					comment: '',
					name: 'database_name',
					port: 1521,
					service: 'database_service',
					username: 'database_username',
					password: 'database_password',
					containerDatabase: null,
					schemas: [],
					customSelect: 'custom',
				}],
			}],
		});

		// with container database
		expect(validateConfig({
			hosts: [{
				enabled: true,
				name: 'host_name',
				address: '127.0.0.1',
				databases: [{
					enabled: true,
					name: 'database_name',
					port: 1521,
					service: 'database_service',
					username: 'database_username',
					password: 'database_password',
					containerDatabase: {
						port: 1521,
						service: 'container_service',
						username: 'container_username',
						password: 'container_password',
					},
					schemas: [],
				}],
			}],
		})).toStrictEqual({
			options: {
				pollingSeconds: 60,
				hidePasswords: false,
				connectTimeoutSeconds: 5,
			},
			customSelectRepository: {},
			hosts: [{
				enabled: true,
				name: 'host_name',
				address: '127.0.0.1',
				probe: true,
				databases: [{
					enabled: true,
					comment: '',
					name: 'database_name',
					port: 1521,
					service: 'database_service',
					username: 'database_username',
					password: 'database_password',
					customSelect: '',
					containerDatabase: {
						port: 1521,
						service: 'container_service',
						username: 'container_username',
						password: 'container_password',
					},
					schemas: [],
				}],
			}],
		});

		// with container database port
		expect(validateConfig({
			hosts: [{
				enabled: true,
				name: 'host_name',
				address: '127.0.0.1',
				databases: [{
					enabled: true,
					name: 'database_name',
					port: 1521,
					service: 'database_service',
					username: 'database_username',
					password: 'database_password',
					containerDatabase: {
						port: 1522,
					},
					schemas: [],
				}],
			}]
		})).toStrictEqual({
			options: {
				pollingSeconds: 60,
				hidePasswords: false,
				connectTimeoutSeconds: 5,
			},
			customSelectRepository: {},
			hosts: [{
				enabled: true,
				name: 'host_name',
				address: '127.0.0.1',
				probe: true,
				databases: [{
					enabled: true,
					comment: '',
					name: 'database_name',
					port: 1521,
					service: 'database_service',
					username: 'database_username',
					password: 'database_password',
					customSelect: '',
					containerDatabase: {
						port: 1522,
						service: 'database_service',
						username: 'database_username',
						password: 'database_password',
					},
					schemas: [],
				}],
			}],
		});

		// with container database service
		expect(validateConfig({
			hosts: [{
				enabled: true,
				name: 'host_name',
				address: '127.0.0.1',
				databases: [{
					enabled: true,
					name: 'database_name',
					port: 1521,
					service: 'database_service',
					username: 'database_username',
					password: 'database_password',
					containerDatabase: {
						service: 'container_service',
					},
					schemas: [],
				}],
			}]
		})).toStrictEqual({
			options: {
				pollingSeconds: 60,
				hidePasswords: false,
				connectTimeoutSeconds: 5,
			},
			customSelectRepository: {},
			hosts: [{
				enabled: true,
				name: 'host_name',
				address: '127.0.0.1',
				probe: true,
				databases: [{
					enabled: true,
					comment: '',
					name: 'database_name',
					port: 1521,
					service: 'database_service',
					username: 'database_username',
					password: 'database_password',
					customSelect: '',
					containerDatabase: {
						port: 1521,
						service: 'container_service',
						username: 'database_username',
						password: 'database_password',
					},
					schemas: [],
				}],
			}],
		});

		// with container database username
		expect(validateConfig({
			hosts: [{
				enabled: true,
				name: 'host_name',
				address: '127.0.0.1',
				databases: [{
					enabled: true,
					name: 'database_name',
					port: 1521,
					service: 'database_service',
					username: 'database_username',
					password: 'database_password',
					containerDatabase: {
						username: 'container_username',
					},
					schemas: [],
				}],
			}]
		})).toStrictEqual({
			options: {
				pollingSeconds: 60,
				hidePasswords: false,
				connectTimeoutSeconds: 5,
			},
			customSelectRepository: {},
			hosts: [{
				enabled: true,
				name: 'host_name',
				address: '127.0.0.1',
				probe: true,
				databases: [{
					enabled: true,
					comment: '',
					name: 'database_name',
					port: 1521,
					service: 'database_service',
					username: 'database_username',
					password: 'database_password',
					customSelect: '',
					containerDatabase: {
						port: 1521,
						service: 'database_service',
						username: 'container_username',
						password: 'database_password',
					},
					schemas: [],
				}],
			}],
		});

		// with container database password
		expect(validateConfig({
			hosts: [{
				enabled: true,
				name: 'host_name',
				address: '127.0.0.1',
				databases: [{
					enabled: true,
					name: 'database_name',
					port: 1521,
					service: 'database_service',
					username: 'database_username',
					password: 'database_password',
					containerDatabase: {
						password: 'container_password',
					},
					schemas: [],
				}],
			}]
		})).toStrictEqual({
			options: {
				pollingSeconds: 60,
				hidePasswords: false,
				connectTimeoutSeconds: 5,
			},
			customSelectRepository: {},
			hosts: [{
				enabled: true,
				name: 'host_name',
				address: '127.0.0.1',
				probe: true,
				databases: [{
					enabled: true,
					comment: '',
					name: 'database_name',
					port: 1521,
					service: 'database_service',
					username: 'database_username',
					password: 'database_password',
					customSelect: '',
					containerDatabase: {
						port: 1521,
						service: 'database_service',
						username: 'database_username',
						password: 'container_password',
					},
					schemas: [],
				}],
			}],
		});
	});

	it('throws an error when the configuration is invalid', () => {
		const tests: [object, string][] = [
			[{hosts: [], options: {pollingSeconds: ''}}, 'The configuration has no valid property "options.pollingSeconds"'],
			[{hosts: ''}, 'The configuration has no property "hosts" of type array'],
			[{hosts: [{enabled: ''}]}, '"enabled" must be a boolean: "hosts[0]"'],
			[{hosts: [{name: ''}]}, '"name" must be a non-empty string: "hosts[0]"'],
			[{hosts: [{name: 'n', address: '', databases: []}]}, '"address" must be a non-empty string: "hosts[0]"'],
			[{hosts: [{name: 'n', address: 'h', databases: ''}]}, '"databases" must be an array: "hosts[0]"'],
			[{hosts: [{name: 'n', address: 'h', databases: [{enabled: ''}]}]}, '"enabled" must be a boolean: "hosts[0].databases[0]"'],
			[{hosts: [{name: 'n', address: 'h', databases: [{enabled: true, name: ''}]}]}, '"name" must be a non-empty string: "hosts[0].databases[0]"'],
			[{hosts: [{name: 'n', address: 'h', databases: [{enabled: true, name: 'n', port: ''}]}]}, '"port" must be an integer between 1 and 65536: "hosts[0].databases[0]"'],
			[{hosts: [{name: 'n', address: 'h', databases: [{enabled: true, name: 'n', port: 1, service: ''}]}]}, '"service" must be a non-empty string: "hosts[0].databases[0]"'],
			[{hosts: [{name: 'n', address: 'h', databases: [{enabled: true, name: 'n', port: 1, service: 's', username: ''}]}]}, '"username" must be a non-empty string: "hosts[0].databases[0]"'],
			[{hosts: [{name: 'n', address: 'h', databases: [{enabled: true, name: 'n', port: 1, service: 's', username: 'u', password: ''}]}]}, '"password" must be a non-empty string: "hosts[0].databases[0]"'],
			[{hosts: [{name: 'n', address: 'h', databases: [{enabled: true, name: 'n', port: 1, service: 's', username: 'u', password: 'p'}]}]}, '"schemas" must be an array: "hosts[0].databases[0]"'],
			[{hosts: [{name: 'n', address: 'h', databases: [{enabled: true, name: 'n', port: 1, service: 's', username: 'u', password: 'p', schemas: [{enabled: ''}]}]}]}, '"enabled" must be a boolean: "hosts[0].databases[0].schemas[0]"'],
			[{hosts: [{name: 'n', address: 'h', databases: [{enabled: true, name: 'n', port: 1, service: 's', username: 'u', password: 'p', schemas: [{enabled: true, name: ''}]}]}]}, '"name" must be a non-empty string: "hosts[0].databases[0].schemas[0]"'],
			[{hosts: [{name: 'n', address: 'h', databases: [{enabled: true, name: 'n', port: 1, service: 's', username: 'u', password: 'p', schemas: [{enabled: true, name: 'n', username: ''}]}]}]}, '"username" must be a non-empty string: "hosts[0].databases[0].schemas[0]"'],
			[{hosts: [{name: 'n', address: 'h', databases: [{enabled: true, name: 'n', port: 1, service: 's', username: 'u', password: 'p', schemas: [{enabled: true, name: 'n', username: 'u', password: ''}]}]}]}, '"password" must be a non-empty string: "hosts[0].databases[0].schemas[0]"'],
			[{hosts: [{name: 'n', address: 'h', databases: [{enabled: true, name: 'n', port: 1, service: 's', username: 'u', password: 'p', schemas: [], containerDatabase: ''}]}]}, '"containerDatabase" must be an object: "hosts[0].databases[0]"'],
			[{hosts: [{name: 'n', address: 'h', databases: [{enabled: true, name: 'n', port: 1, service: 's', username: 'u', password: 'p', schemas: [], containerDatabase: {port: ''}}]}]}, '"port" must be an integer between 1 and 65536: "hosts[0].databases[0].containerDatabase"'],
			[{hosts: [{name: 'n', address: 'h', databases: [{enabled: true, name: 'n', port: 1, service: 's', username: 'u', password: 'p', schemas: [], containerDatabase: {port: 1521, service: ''}}]}]}, '"service" must be a non-empty string: "hosts[0].databases[0].containerDatabase"'],
			[{hosts: [{name: 'n', address: 'h', databases: [{enabled: true, name: 'n', port: 1, service: 's', username: 'u', password: 'p', schemas: [], containerDatabase: {port: 1521, service: 's', username: ''}}]}]}, '"username" must be a non-empty string: "hosts[0].databases[0].containerDatabase"'],
			[{hosts: [{name: 'n', address: 'h', databases: [{enabled: true, name: 'n', port: 1, service: 's', username: 'u', password: 'p', schemas: [], containerDatabase: {port: 1521, service: 's', username: 'u', password: ''}}]}]}, '"password" must be a non-empty string: "hosts[0].databases[0].containerDatabase"'],
		];

		tests.forEach(test => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
			expect(() => validateConfig(test[0] as any)).toThrow(test[1]);
		});
	});
});
