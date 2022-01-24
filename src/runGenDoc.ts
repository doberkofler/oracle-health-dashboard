import debugModule from 'debug';
import {configLoad, buildTree} from './config.js';
import {installShutdown} from './shutdown.js';
import {getHtmlPage} from './html/html.js';
import {textSave} from './util/files.js';
import {inspect} from './util/util.js';

import type {databaseType} from './config.js';

const debug = debugModule('oracle-health-dashboard:rungendoc');

export async function runGenDoc(configFilename: string) {
	debug('runGenDoc', configFilename);

	// install shutdown handler
	installShutdown();

	// load configuration
	debug('load configuration');
	const config = configLoad(configFilename);

	// generate tree
	const tree = buildTree(config.databases);
	console.log(inspect(tree));

	// generate documentation
	const content = genDoc(config.databases);
	const filename = 'config.html';
	textSave(filename, content);
	console.log(`Generated documention in file ${filename}`);
}

function genDoc(databases: databaseType[]): string {
	const html = [] as string[];
	const headers = ['Host', 'Database', 'Schema'];

	html.push('<table>');

	html.push('<tr>');
	headers.forEach(e => html.push(`<th>${e}</th>`));
	html.push('</tr>');

	html.push('<tr>');
	databases.forEach(e => html.push(`<th>${e}</th>`));
	html.push('</tr>');

	html.push('</table>');

	return getHtmlPage('Configuration', html);
}
