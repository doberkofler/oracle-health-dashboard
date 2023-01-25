import debugModule from 'debug';
import {getPage} from './pages/pageGenDoc/server';

import type express from 'express';
import type {configType} from '../shared/types';

const debug = debugModule('oracle-health-dashboard:handlergenDoc');

export const getHtml = (config: configType, _req: express.Request, res: express.Response): express.Response => {
	debug('getHtml');
		
	// get page
	const html = getPage(config);

	// set header and status
	res.contentType('text/html');
	res.status(200);
		
	return res.send(html);
};

export const handlerGenDoc = (app: express.Application, config: configType): void => {
	debug('handlerGenDoc');

	app.get('/gendoc', (req, res) => getHtml(config, req, res));
};
