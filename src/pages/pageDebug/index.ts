import debugModule from 'debug';
import {statsLoad} from '../../statsStore.js';
import {getHtmlPage} from '../../html/html.js';
import {prettyFormat} from '../../util/util.js';

import type {configType} from '../../config/types.js';

const debug = debugModule('oracle-health-dashboard:pageDebug');

export function getPage(config: configType): string {
	debug('getPage');

	// load stats
	const stats = statsLoad();

	// create page
	const html = getHtmlPage('Debug', `<pre>${prettyFormat({config, stats})}</pre>`);

	return html;
}
