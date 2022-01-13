import {configLoad, validateConfig} from '../src/config.js';
import type {configExternType} from '../src/config.js';

describe('configLoad', () => {
	it('loads the configuration and returns a validated configuration object or throws an error', () => {
		expect(() => configLoad()).not.toThrow();
		expect(configLoad('./__tests__/config.test.json')).toStrictEqual({http_port: 80, pollingSeconds: 60, cdb: []});
	});
});

describe('validateConfig', () => {
	it('returns a validated configuration object', () => {
		expect(validateConfig({cdb: []})).toStrictEqual({http_port: 80, pollingSeconds: 60, cdb: []});
		expect(validateConfig({http_port: 9090, pollingSeconds: 90, cdb: []})).toStrictEqual({http_port: 9090, pollingSeconds: 90, cdb: []});
		expect(validateConfig({cdb: [{name: 'name', connection: 'connection', username: 'username', password: 'password'}]})).toStrictEqual({http_port: 80, pollingSeconds: 60, cdb: [{name: 'name', connection: 'connection', username: 'username', password: 'password'}]});
	});

	it('throws an error when the configuration is invalid', () => {
		const tests: [object, string][] = [
			[{http_port: '80'}, 'The configuration has an no valid property "port"'],
			[{pollingSeconds: '80'}, 'The configuration has an no valid property "pollingSeconds"'],
			[{cdb: 'cdb'}, 'The configuration has no property "cdb" of type array'],
			[{cdb: [{name: '', connection: 'connection', username: 'username', password: 'password'}]}, 'The configuration has an invalid "name" property in cdb with index "0"'],
			[{cdb: [{name: 'n', connection: '', username: 'u', password: 'p'}]}, 'The configuration has an invalid "connection" property in cdb with index "0"'],
			[{cdb: [{name: 'n', connection: 'c', username: '', password: 'p'}]}, 'The configuration has an invalid "username" property in cdb with index "0"'],
			[{cdb: [{name: 'n', connection: 'c', username: 'u', password: ''}]}, 'The configuration has an invalid "password" property in cdb with index "0"'],
			[{cdb: [{name: 'n', connection: 'c', username: 'u', password: 'p', pdb: 'pdb'}]}, 'The configuration has an invalid "pdb" property in cdb with index "0"'],
			[{cdb: [{name: 'n', connection: 'c', username: 'u', password: 'p', pdb: [{name: '', connection: 'c', username: 'u', password: 'p'}]}]}, 'The configuration has an invalid "name" property in pdb with index "0" of cdb with name "n"'],
			[{cdb: [{name: 'n', connection: 'c', username: 'u', password: 'p', pdb: [{name: 'n', connection: '', username: 'u', password: 'p'}]}]}, 'The configuration has an invalid "connection" property in pdb with index "0" of cdb with name "n"'],
			[{cdb: [{name: 'n', connection: 'c', username: 'u', password: 'p', pdb: [{name: 'n', connection: 'c', username: '', password: 'p'}]}]}, 'The configuration has an invalid "username" property in pdb with index "0" of cdb with name "n"'],
			[{cdb: [{name: 'n', connection: 'c', username: 'u', password: 'p', pdb: [{name: 'n', connection: 'c', username: 'u', password: ''}]}]}, 'The configuration has an invalid "password" property in pdb with index "0" of cdb with name "n"'],
		];
		
		tests.forEach(test => {
			expect(() => validateConfig(test[0] as unknown as configExternType)).toThrow(test[1]);
		});
	});
});
