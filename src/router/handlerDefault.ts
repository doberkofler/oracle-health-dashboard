import debugModule from 'debug';
import {getPage} from '../pages/pageDefault/server';

import type express from 'express';
import type {configType} from '../config/types';

const debug = debugModule('oracle-health-dashboard:handlerDefault');

/*
*	handler "default"
*/
export function handlerDefault(config: configType, _req: express.Request, res: express.Response): express.Response {
	debug('handlerDefault');
		
	// get page
	const html = getPage(config);

	// set header and status
	res.contentType('text/html');
	res.status(200);
		
	return res.send(html);
}
