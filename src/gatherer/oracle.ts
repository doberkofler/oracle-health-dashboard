import debugModule from 'debug';
import oracledb from 'oracledb';
import {isDate, inspect} from '../util/util.js';

const debug = debugModule('oracle-health-dashboard:oracle');

export type connectionOptionsType = {
	name: string,
	connection: string,
	username: string,
	password: string,
};

export type bindingsType = Array<{
	id: string,
	type: number,
}>;

/*
*	Connect with database
*/
export async function connect(options: connectionOptionsType): Promise<oracledb.Connection | string> {
	debug(`Connect with database "${options.name}" as "${options.username}" at "${options.connection}"`);

	const connectionAttributes: oracledb.ConnectionAttributes = {
		connectionString: options.connection,
		user: options.username,
		password: options.password,
	};

	if (options.username.toLowerCase() === 'sys') {
		connectionAttributes.privilege = oracledb.SYSDBA;
	}

	let connection;
	try {
		connection = await oracledb.getConnection(connectionAttributes);
	} catch (e: unknown) {
		const message = `Unable to connect with database "${options.name}" as "${options.username}" at "${options.connection}"`;
		console.error(message, e);
		return message + '\n' + (e as Error).message;
	}

	return connection;
}

/*
*	Disconnect from database
*/
export async function disconnect(name: string, connection: oracledb.Connection): Promise<string | undefined> {
	debug(`Disconnect from database "${name}"`);

	try {
		connection.close();
	} catch (e: unknown) {
		const message = `Unable to disconnect from database "${name}"`;
		console.error(message, e);
		return message + '\n' + (e as Error).message;
	}

	return undefined;
}

/*
*	execute pl/sql block
*/
export async function execute<T>(connection: oracledb.Connection, sql: string, bindings: bindingsType): Promise<T | string> {
	// convert bindings object to the binding objected needed for oracledb
	const binds = {} as Record<string, {type: number, dir: number}>;
	bindings.forEach(binding => {
		const placeholder = getPlaceholder(binding.id, bindings);

		binds[placeholder] = {
			type: binding.type,
			dir: oracledb.BIND_OUT,
		};
	});

	// execute pl/sql block and return values
	let result: oracledb.Result<unknown>;
	try {
		result = await connection.execute(sql, binds);
	} catch (e: unknown) {
		const message = `Unable to execute "${sql}" with bindings "${inspect(bindings)}"`;
		console.error(message, e);
		return message + '\n' + (e as Error).message;
	}

	// get the results
	const data = {} as Record<string, string | number | Date | null>;
	bindings.forEach(binding => {
		const id = binding.id;
		const placeholder = getPlaceholder(id, bindings);

		switch (binding.type) {
		case oracledb.STRING:
			data[id] = getBindString(result, placeholder);
			break;

		case oracledb.NUMBER:
			data[id] = getBindNumber(result, placeholder);
			break;

		case oracledb.DATE:
			data[id] = getBindDate(result, placeholder);
			break;

		default:
			throw new Error(`Invalid bind type "${binding.type}" found for placeholder "${placeholder}"`);
		}
	});

	return data as unknown as T;
}

/*
*	get placeholder name
*/
export function getPlaceholder(id: string, bindings: bindingsType): string {
	const index = bindings.findIndex(e => e.id === id);
	if (index === -1) {
		throw new Error(`No placeholder "${id}" found`);
	}

	return `p${index + 1}`;
}

/*
*	get string from outBind
*/
function getBindString(result: oracledb.Result<unknown>, placeholder: string): string | null {
	const value = (result as {outBinds: Record<string, unknown>}).outBinds[placeholder];

	if (value === null || typeof value === 'string') {
		return value;
	} else {
		throw new Error(`The result object does not contain a property "${placeholder}" of type "string"\n${inspect(result)}`);
	}
}

/*
*	get number from outBind
*/
function getBindNumber(result: oracledb.Result<unknown>, placeholder: string): number | null {
	const value = (result as {outBinds: Record<string, unknown>}).outBinds[placeholder];

	if (value === null || typeof value === 'number') {
		return value;
	} else {
		throw new Error(`The result object does not contain a property "${placeholder}" of type "number"\n${inspect(result)}`);
	}
}

/*
*	get date from outBind
*/
function getBindDate(result: oracledb.Result<unknown>, placeholder: string): Date | null {
	const value = (result as {outBinds: Record<string, unknown>}).outBinds[placeholder];

	if (value === null) {
		return null;
	} else if (isDate(value)) {
		return new Date(value);
	} else {
		throw new Error(`The result object does not contain a property "${placeholder}" of type "Date"\n${inspect(result)}`);
	}
}
