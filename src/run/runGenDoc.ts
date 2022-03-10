import debugModule from 'debug';
import {textSave} from '../util/files.js';
import {configLoad} from '../config/config.js';
import {installShutdown} from '../shutdown.js';
import {getPage} from '../pages/pageConfig/index.js';

const debug = debugModule('oracle-health-dashboard:rungendoc');

export function runGenDoc(configFilename: string, encryptionKey: string): void {
	debug('runGenDoc', configFilename, encryptionKey);

	// install shutdown handler
	installShutdown();

	// load configuration
	debug('load configuration');
	const config = configLoad(configFilename, encryptionKey);

	// generate documentation
	const content = getPage(config);
	const filename = 'config.html';
	textSave(filename, content);
	console.log(`Generated documention in file ${filename}`);
}
