/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* istanbul ignore file */

import {runServer} from './run/server.js';
import {runPing} from './run/ping.js';
import {runGenDoc} from './run/gendoc.js';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

yargs(hideBin(process.argv))
	.command({
		command: ['start', '$0'],
		describe: 'Start the server',
		handler: async argv => runServer(argv.config as string)
	})
	.command({
		command: 'ping',
		describe: 'Ping all database connections and show results',
		handler: async argv => runPing(argv.config as string)
	})
	.command({
		command: 'gendoc',
		describe: 'Generate documentation of the configuration',
		handler: argv => {
			runGenDoc(argv.config as string);
		}
	})
	.option('config', {
		demandOption: false,
		default: 'config.json',
		describe: 'configuration file',
		type: 'string',
	})
	.demandCommand()
	.strict()
	.help()
	.argv;
