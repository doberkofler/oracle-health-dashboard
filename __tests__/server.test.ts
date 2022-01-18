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
			pollSchema: true,
			databases: [],
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
		expect(response.text).toBe('<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Oracle Health Dashboard</title><meta name="description" content="Oracle Health Dashboard"><meta http-equiv="refresh" content="60" ><link rel="stylesheet" href="static/bootstrap/css/bootstrap.min.css"><link rel="stylesheet" href="static/index.css"></head><body><div class="dashboard"><div class="page-header"><h2>Oracle Health Dashboard</h2></div><div class="dashboard-grid"></div></div></body></html>');
	});

	it('handlerDebug', async () => {
		const response = await request(app).get('/debug').send({});
		expect(response.statusCode).toBe(200);
	});
});
