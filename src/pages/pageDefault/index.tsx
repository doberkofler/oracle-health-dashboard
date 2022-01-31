import {getHtmlPage} from '../../html/html.js';
import debugModule from 'debug';
import {StatusPage} from '../StatusPage/index.js';
import {statsLoad} from '../../statsStore.js';
import {flatten} from '../../config/flatten.js';
import React from 'react';
import ReactDOMServer from 'react-dom/server.js';

import type {configType} from '../../config/config.js';

const debug = debugModule('oracle-health-dashboard:pageDefault');

/*
*	get page
*/

export function getPage(config: configType): string {
	debug('getPage');

	// load stats
	const stats = statsLoad();

	// flatten out the host/database/schema structure and merge with the statistics
	const rows = flatten(config.hosts, stats);

	// render page
	const app = ReactDOMServer.renderToString(<StatusPage rows={rows} showPassword={!config.hidePasswords} />);

	// create page
	const html = getHtmlPage('Status', `<div id="root">${app}</div>`, {refreshSecs: config.pollingSeconds});

	return html;
}
