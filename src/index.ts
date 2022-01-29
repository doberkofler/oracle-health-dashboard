/* istanbul ignore file */

import {runServer} from './runServer.js';
import {runPing} from './runPing.js';
import {runGenDoc} from './runGenDoc.js';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

yargs(hideBin(process.argv))
	.command({
		command: ['start', '$0'],
		describe: 'Start the server',
		handler: argv => {
			void runServer(argv.config as string);
		}
	})
	.command({
		command: 'ping',
		describe: 'Ping all database connections and show results',
		handler: argv => {
			void runPing(argv.config as string);
		}
	})
	.command({
		command: 'gendoc',
		describe: 'Generate documentation of the configuration',
		handler: argv => {
			void runGenDoc(argv.config as string);
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
