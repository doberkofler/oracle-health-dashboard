import debugModule from 'debug';
import {getPage} from '../pages/pageConfig/index';

import type express from 'express';
import type {configType} from '../config/types';

const debug = debugModule('oracle-health-dashboard:handlerConfig');

/*
*	handler "default"
*/
export function handlerConfig(config: configType, _req: express.Request, res: express.Response): express.Response {
	debug('"handlerConfig');

	// get page
	const html = getPage(config);

	// set header and status
	res.contentType('text/html');
	res.status(200);
		
	return res.send(html);
}
