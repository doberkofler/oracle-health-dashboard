import express from 'express';
import debugModule from 'debug';
import {getPage} from '../pages/pageDebug/index.js';

import type {configType} from '../config/config.js';

const debug = debugModule('oracle-health-dashboard:handlerDefault');

/*
*	handler "default"
*/
export async function handlerDebug(config: configType, _req: express.Request, res: express.Response): Promise<express.Response> {
	debug('handlerDefault');
		
	// get page
	const html = getPage(config);

	// set header and status
	res.contentType('text/html');
	res.status(200);
		
	return res.send(html);
}
