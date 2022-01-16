import {getPage} from '../src/pages/pageDefault';
import {getHtmlPage} from '../src/html/html.js';

describe('getPage', () => {
	it('returns the markup for the default dashboard page', () => {
		const refreshSecs = 60;
		const title = 'Oracle Health Dashboard';
		const content = '<div class="dashboard"><div class="page-header"><h2>Oracle Health Dashboard</h2></div><div class="dashboard-grid"></div></div>';

		expect(getPage([], refreshSecs)).toBe(getHtmlPage(title, content, refreshSecs));
	});
});
