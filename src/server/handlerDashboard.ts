import debugModule from 'debug';
import {getRootPage} from '../shared/util/html';

import type express from 'express';
import type {configType} from '../shared/types';

const debug = debugModule('oracle-health-dashboard:handlerDashboard');

const getHtml = (config: configType, _req: express.Request, res: express.Response): express.Response => {
	debug('getHtml');
		
	// get page
	const html = getRootPage({
		title: 'Dashboard',
		app: '',
		script: 'static/client/pageDashboard/index.js',
		data: {
			config,
		},
	});

	// set header and status
	res.contentType('text/html');
	res.status(200);
		
	return res.send(html);
};

export const handlerDashboard = (app: express.Application, config: configType): void => {
	debug('handlerDashboard');

	app.get('/', (req, res) => getHtml(config, req, res));
	app.get('/dashboard', (req, res) => getHtml(config, req, res));
};
