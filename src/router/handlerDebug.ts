import express from 'express';
import debugModule from 'debug';
import {statsLoad} from '../statsStore.js';
import {getHtmlPage} from '../html/html.js';
import {inspect} from '../util/util.js';

import type {configType} from '../config.js';

const debug = debugModule('oracle-health-dashboard:handlerDebug');

/*
*	handler "default"
*/
export async function handlerDebug(config: configType, _req: express.Request, res: express.Response): Promise<express.Response> {
	debug('"handlerDebug');
		
	const html = await getPage(config);

	// set header and status
	res.contentType('text/html');
	res.status(200);
		
	return res.send(html);
}

/*
*	get page
*/
async function getPage(config: configType): Promise<string> {
	debug('getPage');

	const title = 'Debug page';

	const stats = await statsLoad();
	stats.forEach(e => {
		e.metrics = e.metrics.slice(-1);

		return e;
	});

	const content = [];
	content.push('<div class="page-header">');
	content.push(	`<h2>${title}</h2>`);
	content.push('</div>');
	content.push('<pre>');
	content.push(inspect({
		timestamp: new Date(),
		config,
		stats,
	}));
	content.push('</pre>');

	return getHtmlPage(title, content, {refreshSecs: config.pollingSeconds});
}
