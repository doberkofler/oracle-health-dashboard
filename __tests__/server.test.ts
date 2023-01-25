import type express from 'express';
import request from 'supertest';
import type * as http from 'http';
import {serverStart, serverStop} from '../src/server/server';
import {statsInitial} from '../src/server/statsStore';
import {commandType} from '../src/server/options';

let app: express.Express;
let server: http.Server;

describe('server', () => {
	beforeAll(async () => {
		const options = {
			command: commandType.start,
			port: 0,
			host: '0.0.0.0',
			config: 'config.json',
			isInit: false,
			isLogger: false,
			encryptionKey: '',
		};
		const config = {
			options: {
				pollingSeconds: 60,
				hidePasswords: false,
				connectTimeoutSeconds: 5,
			},
			customSelectRepository: {},
			hosts: [],
		};

		statsInitial([]);

		const result = await serverStart(options, config);
		app = result.app;
		server = result.server;
	});

	afterAll(() => void serverStop(server));

	it('handlerDefault', async () => {
		const response = await request(app).get('').send({});
		expect(response.statusCode).toBe(200);
	});

	it('handlerConfig', async () => {
		const response = await request(app).get('/config').send({});
		expect(response.statusCode).toBe(200);
	});
});
