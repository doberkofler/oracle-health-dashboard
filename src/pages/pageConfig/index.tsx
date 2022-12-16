import debugModule from 'debug';
import {StatusPage} from '../../components/StatusPage/index.js';
import {getHtmlPage} from '../../html/html.js';
import {getConnectionFlags} from '../../config/connection.js';
import {flatten} from '../../config/flatten.js';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import type {configType} from '../../config/types.js';

const debug = debugModule('oracle-health-dashboard:pageConfig');

export function getPage(config: configType): string {
	debug('getPage');

	// flatten out the host/database/schema structure
	const rows = flatten(config.hosts, getConnectionFlags(config.options));

	// create page
	const app = ReactDOMServer.renderToString(<StatusPage rows={rows} />);

	// create page
	const html = getHtmlPage('Configuration', `<div id="root">${app}</div>`);

	return html;
}
