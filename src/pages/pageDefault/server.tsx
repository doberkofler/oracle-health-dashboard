import {getHtmlPage} from '../../html/html.js';
import debugModule from 'debug';
import {StatusPage} from '../../components/StatusPage/index.js';
import {statsLoad} from '../../statsStore.js';
import {getConnectionFlags} from '../../config/connection.js';
import {flatten} from '../../config/flatten.js';
import React from 'react';
import ReactDOMServer from 'react-dom/server.js';

import type {configType} from '../../config/types.js';

const debug = debugModule('oracle-health-dashboard:pageDefault');

/*
*	get page
*/

export function getPage(config: configType): string {
	debug('getPage');

	// load stats
	const stats = statsLoad();

	// flatten out the host/database/schema structure and merge with the statistics
	const rows = flatten(config.hosts, getConnectionFlags(config.options), stats);

	// render page
	const app = ReactDOMServer.renderToString(<StatusPage rows={rows} />);

	// create page content with serialized data structured required to hydrate on client
	const content = `<div id="root">${app}</div><script>window.__reactjs_ssr_data = '${JSON.stringify(rows)}';</script>`;

	// create page
	const html = getHtmlPage('Status', content, 'static/client/pageDefault/index.js');

	return html;
}
