import type express from 'express';
import request from 'supertest';
import type * as http from 'http';
import {serverStart, serverStop} from '../src/server/index';
import {statsInitial} from '../src/statsStore';

let app: express.Express;
let server: http.Server;

describe('server', () => {
	beforeAll(async () => {
		const config = {
			options: {
				http_port: 12345,
				pollingSeconds: 60,
				hidePasswords: false,
				connectTimeoutSeconds: 5,
			},
			customSelectRepository: {},
			hosts: [],
		};

		statsInitial([]);

		const result = await serverStart(config);
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
