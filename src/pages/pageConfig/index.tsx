import debugModule from 'debug';
import {StatusPage} from '../../components/StatusPage/index';
import {getHtmlPage} from '../../html/html';
import {getConnectionFlags} from '../../config/connection';
import {flatten} from '../../config/flatten';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import type {configType} from '../../types';

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
