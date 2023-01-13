/* istanbul ignore file */

import fs from 'node:fs';
import {Command} from 'commander';

type commandType = 'start' | 'ping' | 'gendoc' | 'encrypt';

type cliOptionsType = {
	command: commandType,
	config: string,
	encryptionKey: string,
};

const getVersion = (): string => {
	const data = fs.readFileSync('package.json', 'utf8');
	const json = JSON.parse(data) as {version?: string};

	return typeof json.version === 'string' ?  json.version : '';
};

export const getCliOptions = (): cliOptionsType => {
	const program = new Command();

	let command: commandType = 'start';

	program
		.name('oracle-health-dashboard')
		.description('Simple Health Monitor, which continuously monitors and stores Oracle resources metrics')
		.version(getVersion());

	program.command('start')
		.description('Start the server')
		.action(() => {
			command = 'start';
		});

	program.command('ping')
		.description('Ping all database connections and show results')
		.action(() => {
			command = 'ping';
		});

	program.command('gendoc')
		.description('Generate documentation of the configuration')
		.action(() => {
			command = 'gendoc';
		});

	program.command('encrypt')
		.description('Encrypt the configuration file')
		.action(() => {
			command = 'encrypt';
		});

	program
		.option('-c --config [filename]', 'Configuration file', 'config.json')
		.option('-e --encryptionKey [key]', 'encryption key needed for when using encrypted configuration files', '');

	program.parse();

	const options = program.opts<{
		config: string,
		encryptionKey: string,
	}>();

	return {
		command,
		config: options.config,
		encryptionKey: options.encryptionKey,
	};
};
