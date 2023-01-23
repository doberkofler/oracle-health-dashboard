import debugModule from 'debug';
import {statsLoad} from '../../statsStore';
import {getHtmlPage} from '../../html/html';
import {prettyFormat} from '../../util/util';

import type {configType} from '../../types';

const debug = debugModule('oracle-health-dashboard:pageDebug');

export function getPage(config: configType): string {
	debug('getPage');

	// load stats
	const stats = statsLoad();

	// create page
	const html = getHtmlPage('Debug', `<pre>${prettyFormat({config, stats})}</pre>`);

	return html;
}
