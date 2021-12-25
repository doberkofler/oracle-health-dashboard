import fs from 'fs';

const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
const reMsAjax = /^\/Date\((d|-|.*)\)[/|\\]$/;

/*
 * Load text file
 */
export function textLoad(filename: string): string {
	try {
		return fs.readFileSync(filename, 'utf8');
	} catch (e: unknown) {
		throw new Error(`The file "${filename}" cannot be read`);
	}
}

/*
 * Load json file
 */
export function jsonLoad<T>(filename: string): T {
	const data = textLoad(filename);

	try {
		return JSON.parse(data, jsonDateParser);
	} catch (e: unknown) {
		throw new Error(`The file "${filename}" is not a valid json file`);
	}
}

/*
 * Save json file
 */
export function jsonSave(filename: string, value: unknown): void {
	let data;
	
	try {
		data = JSON.stringify(value);
	} catch (e: unknown) {
		throw new Error('Unable to JSON.stringify');
	}

	try {
		fs.writeFileSync(filename, data, {});
	} catch (e: unknown) {
		throw new Error(`The file "${filename}" cannot be written`);
	}
}


/*
*	JSON date parser
*/
function jsonDateParser(_key: string, value: unknown) {
	if (typeof value === 'string') {
		let a = reISO.exec(value);
		if (a) {
			return new Date(value);
		}
		
		a = reMsAjax.exec(value);
		if (a) {
			const b = a[1].split(/[-+,.]/);
			return new Date(b[0] ? +b[0] : 0 - +b[1]);
		}
	}
	
	return value;
}
