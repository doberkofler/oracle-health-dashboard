import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

export type optionsType = {
	config: string,
};

export function getOptions(): optionsType {
	const argv = yargs(hideBin(process.argv))
		.option('config', {
			demandOption: false,
			default: 'config.json',
			describe: 'configuration file',
			type: 'string',
		})
		.help()
		.argv as Record<string, unknown>;

	return {
		config: argv.config as string,
	};
}
