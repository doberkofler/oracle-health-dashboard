import debugModule from 'debug';
import {getOptions} from './options.js';
import {main} from './main.js';
import {runPing} from './ping.js';

const debug = debugModule('oracle-health-dashboard:index');

// get options
const options = getOptions(process.argv);
debug('getOptions', options);

if (options.ping) {
	void runPing(options);
} else {
	void main(options);
}
