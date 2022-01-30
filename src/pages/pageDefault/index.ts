import {isDate, distanceToString, numberToString, timestampToString, inspect} from '../../util/util.js';
import {getHtmlPage} from '../../html/html.js';
import debugModule from 'debug';

import type {sqlInitialType} from '../../database/initialize.js';
import type {statsDatabaseType, statusMetricType} from '../../statsStore';

const debug = debugModule('oracle-health-dashboard:pageDefault');

/*
*	get page
*/
export function getPage(stats: statsDatabaseType[], pollingSeconds: number): string {
	debug('getPage');

	const title = 'Status';

	const html = [] as string[];
	html.push('<div class="dashboard">');
	html.push(	'<div class="page-header">');
	html.push(		`<h2>${title}</h2>`);
	html.push(	'</div>');
	html.push(	'<div class="dashboard-grid">');
	stats.map(renderDatabase.bind(null, html));
	html.push(	'</div>');
	html.push('</div>');

	return getHtmlPage(title, html, {refreshSecs: pollingSeconds});
}

function renderDatabase(html: Array<string>, database: statsDatabaseType) {
	debug('renderDatabase');

	const metric = database.metrics.length > 0 ? database.metrics[database.metrics.length - 1] : null;
	const online = metric ? metric.success : false;
	const timestamp = metric && isDate(metric.timestamp) ? distanceToString(metric.timestamp) : '';
	const noOfSessions = metric && typeof metric.no_of_sessions === 'number' ? metric.no_of_sessions.toFixed() : '-';
	const cpu = metric && typeof metric.host_cpu_utilization === 'number' ? metric.host_cpu_utilization.toFixed() + '%' : '-';

	debug('renderDatabase', inspect({host: database.hostName, database: database.databaseName, metric}));

	html.push('<div class="dashboard-card">');
	html.push(	'<div class="card support-bar overflow-hidden card-height">');
	html.push(		'<div class="card-body pb-0">');
	getDatabaseName(html, database);
	html.push(			`<span class="text-c-blue ${online ? 'green' : 'red'}">${online ? 'online' : 'offline'}</span>`);
	html.push(			'&nbsp;');
	html.push(			`<span class="fs-6 fst-lighter">&nbsp;${timestamp}</span>`);
	getDetais(html, database.statics, metric);
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
	html.push(	'</div>');
	html.push('</div>');
}

function getDatabaseName(html: Array<string>, database: statsDatabaseType): void {
	html.push('<div class="card-title-grid">');
	html.push(	'<div>host:</div>');
	html.push(	`<div>${database.hostName}</div>`);
	html.push(	'<div>database:</div>');
	html.push(	`<div>${database.databaseName}</div>`);
	/* TODO:
	if (database.schemaName !== '') {
		html.push(	'<div>schema:</div>');
		html.push(	`<div>${database.schemaName}</div>`);
	}
	*/
	html.push('</div>');
}

function getDetais(html: Array<string>, statics: sqlInitialType | undefined, metric: statusMetricType | null): void {
	html.push('<div class="metrics-enclosure">');

	if (statics && metric) {
		const data = [
			['Oracle version', statics.oracle_version],
			['Oracle platform', statics.oracle_platform],
			['Archive logging', statics.oracle_log_mode],
			['Character set', statics.oracle_database_character_set],
			['SGA target', statics.oracle_sga_target],
			['PGA target', statics.oracle_pga_aggregate_target],
			//['Server date', metric.server_date],
			['Host CPU utilization', metric.host_cpu_utilization, '%'],
			['IO requests per sec', metric.io_requests_per_second],
			['Buffer cache hit ratio', metric.buffer_cache_hit_ratio, '%'],
			['Executions per sec', metric.executions_per_sec],
		];
		html.push('<div class="metrics">');
		data.forEach(row => {
			const title = row[0];
			const value = getValueAsString(row[1]);

			html.push(`<div>${title}</div><div>${value}${value.length > 0 && row.length > 2 ? row[2] : ''}</div>`);
		});
		html.push('</div>');
	}

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
