import {getHtmlPage} from '../../html/html';
import debugModule from 'debug';
import {StatusPage} from '../../components/StatusPage/index';
import {statsLoad} from '../../statsStore';
import {getConnectionFlags} from '../../config/connection';
import {flatten} from '../../config/flatten';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import type {configType} from '../../types';

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

	return getHtmlPage('Status', content, 'static/client/pagegendoc/index.js');
}
