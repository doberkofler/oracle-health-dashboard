/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* istanbul ignore file */

import {runServer} from './run/runServer.js';
import {runPing} from './run/runPing.js';
import {runGenDoc} from './run/runGenDoc.js';
import {runEncrypt} from './run/runEncrypt.js';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

yargs(hideBin(process.argv))
	.command({
		command: ['start', '$0'],
		describe: 'Start the server',
		handler: async argv => runServer(argv.config as string, argv.encryptionKey as string)
	})
	.command({
		command: 'ping',
		describe: 'Ping all database connections and show results',
		handler: async argv => runPing(argv.config as string, argv.encryptionKey as string)
	})
	.command({
		command: 'gendoc',
		describe: 'Generate documentation of the configuration',
		handler: argv => {
			runGenDoc(argv.config as string, argv.encryptionKey as string);
		}
	})
	.command({
		command: 'encrypt',
		describe: 'Encrypt the configuration file',
		handler: argv => {
			if (typeof argv.encryptionKey !== 'string') {
				throw new Error('Missing "encryptionKey" option');
			}
			runEncrypt(argv.config as string, argv.encryptionKey);
		}
	})
	.option('config', {
		demandOption: false,
		default: 'config.json',
		describe: 'configuration file',
		type: 'string',
	})
	.option('encryptionKey', {
		demandOption: false,
		describe: 'encryption key needed for when using encrypted configuration files',
		type: 'string',
	})
	.check(argv => {
		if (argv._.includes('encrypt') && typeof argv.encryptionKey !== 'string') {
			throw new Error('The "encrypt" requires the "encryptionKey" option');
		}

		return true;
	})
	.demandCommand()
	.strict()
	.help()
	.argv;
