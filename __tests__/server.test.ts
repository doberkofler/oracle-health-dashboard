import express from 'express';
import request from 'supertest';
import * as http from 'http';
import {serverStart, serverStop} from '../src/server.js';
import {statsInitial} from '../src/statsStore.js';

let app: express.Express;
let server: http.Server;

describe('server', () => {
	beforeAll(async () => {
		const config = {
			http_port: 12345,
			pollingSeconds: 60,
			hidePasswords: false,
			hosts: [],
		};

		statsInitial([]);

		const result = await serverStart(config);
		app = result.app;
		server = result.server;
	});

	afterAll(() => serverStop(server));

	it('handlerDefault', async () => {
		const response = await request(app).get('').send({});
		expect(response.statusCode).toBe(200);
	});

	it('handlerConfig', async () => {
		const response = await request(app).get('/config').send({});
		expect(response.statusCode).toBe(200);
	});
});
