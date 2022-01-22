import {runServer} from './runServer.js';
import {runPing} from './runPing.js';
import {runGenDoc} from './runGenDoc.js';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

/*const argv = */yargs(hideBin(process.argv))
	.command({
		command: ['start', '$0'],
		describe: 'Start the server',
		//builder: (yargs) => yargs.default('value', 'true'),
		handler: async argv => {
			await runServer(argv.config as string);
		}
	})
	.command({
		command: 'ping',
		describe: 'Ping all database connections and show results',
		//builder: (yargs) => yargs.default('value', 'true'),
		handler: async argv => {
			await runPing(argv.config as string);
		}
	})
	.command({
		command: 'gendoc',
		describe: 'Generate documentation of the configuration',
		//builder: (yargs) => yargs.default('value', 'true'),
		handler: async argv => {
			await runGenDoc(argv.config as string);
		}
	})
	.option('config', {
		demandOption: false,
		default: 'config.json',
		describe: 'configuration file',
		type: 'string',
	})
	.demandCommand()
	.help()
	.argv as Record<string, unknown>;

