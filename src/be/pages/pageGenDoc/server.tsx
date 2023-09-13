import {getHtmlPage} from '../../../shared/util/html';
import debugModule from 'debug';
import {StatusPage} from '../StatusPage/index';
import {statsLoad} from '../../statsStore';
import {getConnectionFlags} from '../../connection';
import {flatten} from '../../flatten';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import type {configType} from '../../../shared/types';

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
