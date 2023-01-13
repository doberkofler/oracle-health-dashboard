import {
	getConnectionString,
	connectionToString,
} from '../src/config/connection';

describe('getConnectionString', () => {
	it('gets the connection string', () => {
		expect(getConnectionString('1', 2, '3', 15)).toBe('1:2/3?connect_timeout=15');
		expect(getConnectionString('1', 2, '3', 0)).toBe('1:2/3');
	});
});

describe('connectionToString', () => {
	it('reads the content of a file into a string', () => {
		expect(connectionToString({
			connectionString: '1',
			username: '2',
			password: '3',
		})).toBe('2/3@1');
	});
});
