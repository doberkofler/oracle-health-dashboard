/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* istanbul ignore file */

import {runServer} from './run/runServer';
import {runPing} from './run/runPing';
import {runGenDoc} from './run/runGenDoc';
import {runEncrypt} from './run/runEncrypt';
import {getCliOptions} from './cli/options';

const main = async (): Promise<void> => {
	const options = getCliOptions();

	switch (options.command) {
		case 'start':
			await runServer(options.config, options.encryptionKey);
			break;

		case 'ping':
			await runPing(options.config, options.encryptionKey);
			break;

		case 'gendoc':
			runGenDoc(options.config, options.encryptionKey);
			break;

		case 'encrypt':
			runEncrypt(options.config, options.encryptionKey);
			break;
	}
};

void main();
