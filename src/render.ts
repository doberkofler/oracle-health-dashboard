import debugModule from 'debug';
import {formatDistance} from 'date-fns';
import {statsLoad} from './statsStore.js';
import {isDate} from './util.js';
import type {configType, databaseConfigType} from './config.js';
import type {statsType} from './statsStore';

const debug = new debugModule('oracle-health-dashboard:render');

const TITLE = 'Oracle Health Dashboard';

export async function render(config: configType): Promise<string> {
	debug('render');

	const stats = await statsLoad();

	const html = [];
	html.push('<html lang="en">');
	html.push(	'<head>');
	html.push(		'<meta charset="UTF-8">');
	html.push(		'<meta name="viewport" content="width=device-width, initial-scale=1.0">');
	html.push(		'<meta http-equiv="X-UA-Compatible" content="ie=edge">');
	html.push(		'<title>Oracle Health Dashboard</title>');
	html.push(		`<meta name="description" content="${TITLE}">`);
	/*
	html.push(		'<link rel="icon" href="static/favicon.ico">');
	*/
	html.push(		'<link rel="stylesheet" href="static/bootstrap/css/bootstrap.min.css">');
	html.push(		'<link rel="stylesheet" href="static/index.css">');
	html.push(	'</head>');
	html.push('<body>');
	html.push('<div class="dashboard">');
	html.push('	<div class="page-header">');
	html.push(		`<h2>${TITLE}</h2>`);
	html.push(	'</div>');
	html.push(	'<div class="dashboard-grid">');
	config.databases.map(database => renderDatabase(html, database, stats));
	html.push('	</div>');
	html.push('</div>');
	html.push('</body>');
	html.push('</html>');

	return html.join('');
}

function renderDatabase(html: Array<string>, database: databaseConfigType, stats: statsType) {
	debug('renderDatabase');

	const databaseStats = stats.databases.find(e => e.name === database.name);
	const lastDatabaseStats = databaseStats.data.length > 0 ? databaseStats.data[databaseStats.data.length - 1] : null;
	const online = lastDatabaseStats ? lastDatabaseStats.success : false;
	const timestamp = lastDatabaseStats && isDate(lastDatabaseStats.endDate) ? distanceToString(lastDatabaseStats.endDate) : '';
	const noOfSessions = lastDatabaseStats && typeof lastDatabaseStats.metrics.number_of_sessions === 'number' ? lastDatabaseStats.metrics.number_of_sessions.toFixed() : '';
	const cpu = lastDatabaseStats && typeof lastDatabaseStats.metrics.host_cpu_utilization === 'number' ? lastDatabaseStats.metrics.host_cpu_utilization.toFixed() + '%' : '';

	//console.log({lastDatabaseStats});

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

/*
*	Format a distance between dates a human readable string
*/
function distanceToString(relativeDate: Date, currentDate = new Date()): string {
	return formatDistance(relativeDate, currentDate, {addSuffix: true});
}
