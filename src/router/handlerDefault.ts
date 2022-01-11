import debugModule from 'debug';
import express from 'express';
import {statsLoad} from '../statsStore.js';
import {isDate, distanceToString, numberToString, timestampToString, inspect} from '../util/util.js';
import {getHtmlPage} from '../html/html.js';

import type {configType} from '../config.js';
import type {statsDataType, statusMetricType} from '../statsStore';

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

	// load stats
	const stats = await statsLoad();

	// sort the list of databases
	stats.sort(sortStats);

	const html = [] as string[];
	html.push('<div class="dashboard">');
	html.push(	'<div class="page-header">');
	html.push(		`<h2>${title}</h2>`);
	html.push(	'</div>');
	html.push(	'<div class="dashboard-grid">');
	stats.map(renderDatabase.bind(null, html));
	html.push(	'</div>');
	html.push('</div>');

	return getHtmlPage(title, html, config.pollingSeconds);
}

function renderDatabase(html: Array<string>, database: statsDataType) {
	debug('renderDatabase');

	const lastDatabaseStats = database.metrics.length > 0 ? database.metrics[database.metrics.length - 1] : null;
	const online = lastDatabaseStats ? lastDatabaseStats.success : false;
	const timestamp = lastDatabaseStats && isDate(lastDatabaseStats.timestamp) ? distanceToString(lastDatabaseStats.timestamp) : '';
	const noOfSessions = lastDatabaseStats && typeof lastDatabaseStats.no_of_sessions === 'number' ? lastDatabaseStats.no_of_sessions.toFixed() : '';
	const cpu = lastDatabaseStats && typeof lastDatabaseStats.host_cpu_utilization === 'number' ? lastDatabaseStats.host_cpu_utilization.toFixed() + '%' : '';

	debug('renderDatabase', inspect({lastDatabaseStats}));

	html.push('<div class="dashboard-card">');
	html.push(	'<div class="card support-bar overflow-hidden card-height">');
	html.push(		'<div class="card-body pb-0">');
	html.push(			getDatabaseName(database));
	html.push(			`<span class="text-c-blue">${online ? 'online' : 'offline'}</span>`);
	html.push(			`<span class="fs-6 fst-lighter">(${timestamp})</span>`);
	if (lastDatabaseStats) {
		getDetais(html, lastDatabaseStats);
	}
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

function getDatabaseName(database: statsDataType): string {
	if (database.pdb_name === '') {
		return `<h5 class="m-0">${database.cdb_name}</h5>`;
	} else {
		return `<h5 class="m-0">CDB: ${database.cdb_name}</h5><h6 class="m-0">PDB: ${database.pdb_name}</h6>`;
	}
}

function getDetais(html: Array<string>, metric: statusMetricType): void {
	const data = [
		['Server date', metric.server_date, ''],
		['Host CPU utilization', metric.host_cpu_utilization, '%'],
		['IO requests per sec', metric.io_requests_per_second, ''],
		['Buffer cache hit ratio', metric.buffer_cache_hit_ratio, '%'],
		['Executions per sec', metric.executions_per_sec, ''],
	];

	html.push('<div class="metrics-enclosure">');
	html.push('<div class="metrics">');
	data.forEach(row => html.push(`<div>${row[0]}</div><div>${getValueAsString(row[1])}${row[2]}</div>`));
	html.push('</div>');
	html.push('</div>');
}

function getValueAsString(value: string | number | boolean | Date | null): string {
	if (typeof value === 'string') {
		return value;
	} else if (typeof value === 'number') {
		return numberToString(value);
	} else if (typeof value === 'boolean') {
		return value ? 'Yes' : 'No';
	} else if (isDate(value)) {
		return timestampToString(value);
	} else {
		return '';
	}
}

function sortStats(a: statsDataType, b: statsDataType): number {
	if (a.cdb_name.toLowerCase() > b.cdb_name.toLowerCase()) {
		return 1;
	} else if (a.cdb_name.toLowerCase() < b.cdb_name.toLowerCase()) {
		return -1;
	} else if (a.pdb_name.toLowerCase() > b.pdb_name.toLowerCase()) {
		return 1;
	} else if (a.pdb_name.toLowerCase() < b.pdb_name.toLowerCase()) {
		return -1;
	} else {
		return 0;
	}
}
