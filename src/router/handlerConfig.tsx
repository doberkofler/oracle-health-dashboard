import debugModule from 'debug';
import {getPage} from '../pages/pageConfig/index';

import type express from 'express';
import type {configType} from '../types';

const debug = debugModule('oracle-health-dashboard:handlerConfig');

const getHtml = (config: configType, _req: express.Request, res: express.Response): express.Response => {
	debug('"getHtml');

	// get page
	const html = getPage(config);

	// set header and status
	res.contentType('text/html');
	res.status(200);
		
	return res.send(html);
};

export const handlerConfig = (app: express.Application, config: configType): void => {
	debug('handlerConfig');

	app.get('/config', (req, res) => getHtml(config, req, res));
};
