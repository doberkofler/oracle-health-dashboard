import {getPage} from '../src/pages/pageDefault';
import {getHtmlPage} from '../src/html/html.js';
import type {statsDatabaseType} from '../src/statsStore.js';

describe('getPage', () => {
	it('returns the markup for an empty dashboard page', () => {
		const refreshSecs = 60;

		const actual = purify(getPage([], refreshSecs));
		const expected = getDashboardPage('', refreshSecs);
		expect(actual).toBe(expected);
	});

	it('returns the markup for a filled dashboard page', () => {
		const NOW = new Date();
		const refreshSecs = 60;
		const database = {
			id: 1,
			hostName: 'host_name',
			databaseName: 'database_name',
			schemaName: '',
			statics: {
				oracle_version: 'oracle_version',
				oracle_platform: 'oracle_platform',
				oracle_log_mode: 'oracle_log_mode',
				oracle_database_character_set: 'oracle_database_character_set',
				oracle_sga_target: 'oracle_sga_target',
				oracle_pga_aggregate_target: 'oracle_pga_aggregate_target',
			},
			metrics: [{
				timestamp: NOW,
				success: true,
				message: '',
				server_date: null,
				host_cpu_utilization: 1,
				io_requests_per_second: 2,
				buffer_cache_hit_ratio: 3,
				executions_per_sec: 4,
				no_of_sessions: 5,
				flashback_percentage: 6,
				last_successful_rman_backup_date_full_db: NOW,
				last_successful_rman_backup_date_archive_log: NOW,
				last_rman_backup_date_full_db: NOW,
				last_rman_backup_date_archive_log: NOW,
			}],
		};

		const actual = purify(getPage([database], refreshSecs));
		const expected = getDashboardPage(getDashboardCard(database), refreshSecs);
		expect(actual).toBe(expected);
	});
});

function getDashboardPage(content: string, refreshSecs: number): string {
	return purify(getHtmlPage('Oracle Health Dashboard', `<div class="dashboard"><div class="page-header"><h2>Oracle Health Dashboard</h2></div><div class="dashboard-grid">${content}</div></div>`, {refreshSecs}));
}

function getDashboardCardMetric(database: statsDatabaseType): string {
	expect(database.metrics).toHaveLength(1);
	expect(typeof database.statics).toBe('object');

	const metric = database.metrics[0];
	const statics = database.statics;

	return `<div class="metrics"><div>Oracle version</div><div>${statics?.oracle_version}</div><div>Oracle platform</div><div>${statics?.oracle_platform}</div><div>Archive logging</div><div>${statics?.oracle_log_mode}</div><div>Character set</div><div>${statics?.oracle_database_character_set}</div><div>SGA target</div><div>${statics?.oracle_sga_target}</div><div>PGA target</div><div>${statics?.oracle_pga_aggregate_target}</div><div>Host CPU utilization</div><div>${metric.host_cpu_utilization}%</div><div>IO requests per sec</div><div>${metric.io_requests_per_second}</div><div>Buffer cache hit ratio</div><div>${metric.buffer_cache_hit_ratio}%</div><div>Executions per sec</div><div>${metric.executions_per_sec}</div></div>`;
}

function getDashboardCard(database: statsDatabaseType): string {
	const metrics = getDashboardCardMetric(database);

	return `<div class="dashboard-card"><div class="card support-bar overflow-hidden card-height"><div class="card-body pb-0"><div class="card-title-grid"><div>host:</div><div>${database.hostName}</div><div>database:</div><div>${database.databaseName}</div></div><span class="text-c-blue green">online</span>&nbsp;<span class="fs-6 fst-lighter">&nbsp;less than a minute ago</span><div class="metrics-enclosure">${metrics}</div></div><div id="support-chart"></div><div class="card-footer bg-primary text-white"><div class="row text-center"><div class="col"><h4 class="m-0 text-white">1%</h4><span>CPU</span></div><div class="col"><h4 class="m-0 text-white">5</h4><span>Sessions</span></div></div></div></div></div>`;
}

function purify(s: string): string {
	return s.replace(/\n/g, '');
}
