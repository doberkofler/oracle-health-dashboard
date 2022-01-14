import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

export type optionsType = {
	config: string,
	ping: boolean,
};

export function getOptions(): optionsType {
	const argv = yargs(hideBin(process.argv))
		.option('config', {
			demandOption: false,
			default: 'config.json',
			describe: 'configuration file',
			type: 'string',
		})
		.option('ping', {
			demandOption: false,
			default: false,
			describe: 'only ping all databases without starting the web server',
			type: 'boolean',
		})
		.help()
		.argv as Record<string, unknown>;

	return {
		config: argv.config as string,
		ping: argv.ping as boolean,
	};
}
