import debugModule from 'debug';
import {configLoad} from './config.js';
import {installShutdown} from './shutdown.js';

const debug = debugModule('oracle-health-dashboard:rungendoc');

export async function runGenDoc(configFilename: string) {
	debug('runGenDoc', configFilename);

	// install shutdown handler
	installShutdown();

	// load configuration
	debug('load configuration');
	const config = configLoad(configFilename);

	console.log(config);
}
