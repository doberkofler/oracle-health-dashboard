import debugModule from 'debug';
import {statsLoad} from '../../statsStore.js';
import {getHtmlPage} from '../../html/html.js';
import {inspect} from '../../util/util.js';

import type {configType} from '../../config/config.js';

const debug = debugModule('oracle-health-dashboard:pageDebug');

export function getPage(config: configType): string {
	debug('getPage');

	// load stats
	const stats = statsLoad();

	// create page
	const html = getHtmlPage('Debug', `<pre>${inspect({config, stats})}</pre>`);

	return html;
}
