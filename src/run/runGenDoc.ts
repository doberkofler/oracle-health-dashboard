import debugModule from 'debug';
import {textSave} from '../util/files';
import {configLoad} from '../config/config';
import {installShutdown} from '../shutdown';
import {getPage} from '../pages/pageConfig/index';

import type {cliOptionsType} from '../cli/options';

const debug = debugModule('oracle-health-dashboard:rungendoc');

export function runGenDoc(options: cliOptionsType): void {
	debug('runGenDoc', options);

	// install shutdown handler
	installShutdown();

	// load configuration
	debug('load configuration');
	const config = configLoad(options.config, options.encryptionKey);

	// generate documentation
	const content = getPage(config);
	const filename = 'config.html';
	textSave(filename, content);
	console.log(`Generated documention in file ${filename}`);
}
