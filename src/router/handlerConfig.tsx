import express from 'express';
import debugModule from 'debug';
import {getPage} from '../pages/pageConfig/index.js';

import type {configType} from '../config.js';

const debug = debugModule('oracle-health-dashboard:handlerConfig');

/*
*	handler "default"
*/
export async function handlerConfig(config: configType, _req: express.Request, res: express.Response): Promise<express.Response> {
	debug('"handlerConfig');

	// get page
	const html = getPage(config);

	// set header and status
	res.contentType('text/html');
	res.status(200);
		
	return res.send(html);
}
