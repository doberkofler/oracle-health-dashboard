/* istanbul ignore file */

import fs from 'node:fs';
import {Command} from 'commander';
import {stringToIntegerWeak} from '../util/util';

export enum commandType {
	start = 'start',
	ping = 'ping',
	gendoc = 'gendoc',
	encrypt = 'encrypt',
}

export type cliOptionsType = {
	command: commandType,
	port: number,
	host: string,
	config: string,
	isInit: boolean,
	encryptionKey: string,
};

const getVersion = (): string => {
	const data = fs.readFileSync('package.json', 'utf8');
	const json = JSON.parse(data) as {version?: string};

	return typeof json.version === 'string' ?  json.version : '';
};

export const getCliOptions = (): cliOptionsType => {
	const program = new Command();

	let command = commandType.start;

	program
		.name('oracle-health-dashboard')
		.description('Simple Health Monitor, which continuously monitors and stores Oracle resources metrics')
		.version(getVersion());

	program.command('start')
		.description('Start the server')
		.action(() => {
			command = commandType.start;
		});

	program.command('ping')
		.description('Ping all database connections and show results')
		.action(() => {
			command = commandType.ping;
		});

	program.command('gendoc')
		.description('Generate documentation of the configuration')
		.action(() => {
			command = commandType.gendoc;
		});

	program.command('encrypt')
		.description('Encrypt the configuration file')
		.action(() => {
			command = commandType.encrypt;
		});

	program
		.option('-a --host [host]', 'Address to use.', '0.0.0.0')
		.option('-p --port [port]', 'Port to use. If 0, look for open port.', '8080')
		.option('-c --config [filename]', 'Configuration file', 'config.json')
		.option('-i --init', 'Initialize database')
		.option('-e --encryptionKey [key]', 'encryption key needed for when using encrypted configuration files', '');

	program.parse();

	const options = program.opts<{
		port: string,
		host: string,
		config: string,
		isInit: boolean,
		encryptionKey: string,
	}>();

	const port = stringToIntegerWeak(options.port);
	if (port === null) {
		program.error('Option "--port" must be an integer');
	}

	return {
		command,
		port: port as unknown as number,
		host: options.host,
		config: options.config,
		isInit: options.isInit,
		encryptionKey: options.encryptionKey,
	};
};
