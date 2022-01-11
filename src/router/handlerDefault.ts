import debugModule from 'debug';
import express from 'express';
import {statsLoad} from '../statsStore.js';
import {isDate, distanceToString, inspect} from '../util/util.js';
import {getHtmlPage} from '../html/html.js';

import type {configType, cdbConfigType/*, pdbConfigType*/} from '../config.js';
import type {statsDataType} from '../statsStore';

const debug = debugModule('oracle-health-dashboard:handlerDefault');

/*
*	handler "default"
*/
export async function handlerDefault(config: configType, _req: express.Request, res: express.Response): Promise<express.Response> {
	debug('handlerDefault');
		
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

	const title = 'Oracle Health Dashboard';

	const stats = await statsLoad();

	const content = [] as string[];
	content.push('<div class="dashboard">');
	content.push(	'<div class="page-header">');
	content.push(		`<h2>${title}</h2>`);
	content.push(	'</div>');
	content.push(	'<div class="dashboard-grid">');
	config.cdb.map(cdb => renderDatabase(content, cdb, stats));
	content.push(	'</div>');
	content.push('</div>');

	return getHtmlPage(title, content);
}

function renderDatabase(html: Array<string>, database: cdbConfigType, data: statsDataType[]) {
	debug('renderDatabase');

	const databaseStats = data.find(e => e.cdb_name === database.name);
	const lastDatabaseStats = databaseStats && databaseStats.metrics.length > 0 ? databaseStats.metrics[databaseStats.metrics.length - 1] : null;
	const online = lastDatabaseStats ? lastDatabaseStats.success : false;
	const timestamp = lastDatabaseStats && isDate(lastDatabaseStats.timestamp) ? distanceToString(lastDatabaseStats.timestamp) : '';
	const noOfSessions = lastDatabaseStats && typeof lastDatabaseStats.no_of_sessions === 'number' ? lastDatabaseStats.no_of_sessions.toFixed() : '';
	const cpu = lastDatabaseStats && typeof lastDatabaseStats.host_cpu_utilization === 'number' ? lastDatabaseStats.host_cpu_utilization.toFixed() + '%' : '';

	debug('renderDatabase', inspect({lastDatabaseStats}));

	html.push('<div class="dashboard-card">');
	html.push(	'<div class="card support-bar overflow-hidden card-height">');
	html.push(		'<div class="card-body pb-0">');
	html.push(			`<h4 class="m-0">${database.name}</h4>`);
	html.push(			`<span class="text-c-blue">${online ? 'online' : 'offline'}</span>`);
	html.push(			`<span class="fs-6 fst-lighter">(${timestamp})</span>`);
	html.push(			'<p class="mb-3 mt-3">Total number of support requests that come in.</p>');
	html.push(		'</div>');
	html.push(		'<div id="support-chart"></div>');
	html.push(		'<div class="card-footer bg-primary text-white">');
	html.push(			'<div class="row text-center">');
	html.push(				'<div class="col">');
	html.push(					`<h4 class="m-0 text-white">${cpu}</h4>`);
	html.push(					'<span>CPU</span>');
	html.push(				'</div>');
	html.push(				'<div class="col">');
	html.push(					`<h4 class="m-0 text-white">${noOfSessions}</h4>`);
	html.push(					'<span>Sessions</span>');
	html.push(				'</div>');
	html.push(			'</div>');
	html.push(		'</div>');
	html.push('	</div>');
	html.push('</div>');
}
