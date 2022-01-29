import express from 'express';
import debugModule from 'debug';
import {statsLoad} from '../statsStore.js';
import {getPage} from '../pages/pageDefault/index.js';

import type {configType} from '../config/config.js';

const debug = debugModule('oracle-health-dashboard:handlerDefault');

/*
*	handler "default"
*/
export async function handlerDefault(config: configType, _req: express.Request, res: express.Response): Promise<express.Response> {
	debug('handlerDefault');
		
	// load stats
	const stats = await statsLoad();

	// get page
	const html = getPage(stats, config.pollingSeconds);

	// set header and status
	res.contentType('text/html');
	res.status(200);
		
	return res.send(html);
}
