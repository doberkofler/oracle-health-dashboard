import debugModule from 'debug';
import {statsLoad} from '../../statsStore';
import {getHtmlPage} from '../../../shared/util/html';
import {prettyFormat} from '../../../shared/util/util';

import type {configType} from '../../../shared/types';

const debug = debugModule('oracle-health-dashboard:pageDebug');

export function getPage(config: configType): string {
	debug('getPage');

	// load stats
	const stats = statsLoad();

	// create page
	const html = getHtmlPage('Debug', `<pre>${prettyFormat({config, stats})}</pre>`);

	return html;
}
