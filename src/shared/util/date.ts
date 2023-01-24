/**
  * Date and time utilities
  *	@module ods/date
  */

//
//	Required
//

import {isValid, format, formatDistance, parse} from 'date-fns';

//
//	Types
//

//
//	Constants
//

export const LOCAL_JSON_DATE_FORMAT = 'yyyy-MM-dd\'T\'HH:mm:ss';
const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/;
//const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
//const reMsAjax = /^\/Date\((d|-|.*)\)[\/|\\]$/;

//
//	Variables
//

//
//	Public
//

/**
 * Is the given value a "Date"
 *
 * @param value - The value to be checked
 * @returns returns true if the value matches the type
 */
export function isDate(value: unknown): value is Date {
	return toString.call(value) === '[object Date]' && isValid(value);
}

/**
 * Return a local date from the given ISO 8601 string representation.
 *
 * @param {string} value - The value to convert
 * @returns {Date} The JavaScript date
 */
export function fromJSON(value: string): Date {
	if (typeof value !== 'string') {
		throw new Error(`Parameter "${value}" is not a string`);
	}

	const date = parse(value, LOCAL_JSON_DATE_FORMAT, new Date());
	if (!isDate(date)) {
		throw new Error(`Parameter "${value}" is not a valid ISO 8601 date string`);
	}

	return date;
}

/**
 * Return a local date from the given ISO 8601 string representation or null if the value is invalid.
 *
 * @param value - The value to convert
 * @returns The JavaScript date
 */
export function fromJSONWeak(value: unknown): Date | null {
	if (typeof value !== 'string' || reISO.exec(value) === null) {
		return null;
	}

	const date = parse(value, LOCAL_JSON_DATE_FORMAT, new Date());
	if (!isDate(date)) {
		return null;
	}

	return date;
}

/**
 * Return a "humalized" relative date/time string.
 *
 * @param	{Date} date - The date to convert.
 * @param	{Date} [base=new Date()] - The optional base date.
 * @returns {string} - The humanized date string.
 * @example	dateToHumanizedString(date) => "2 hours ago"
 */
export function dateToHumanizedString(date: Date, base: Date = new Date()): string {
	if (!isDate(date)) {
		throw new TypeError(`Invalid date "${date}"`);
	}

	return formatDistance(date, base, {addSuffix: true});
}

/**
 * Return a ISO 8601 string representation of the given local date converted to UTC.
 *
 * @param {Date} value - The date to convert
 * @returns {string} The ISO 8601 formatted date string
 */
export function toJSON(value: Date): string {
	if (!isDate(value)) {
		throw new Error(`The parameter is not a valid Date: "${value}"`);
	}

	return format(value, LOCAL_JSON_DATE_FORMAT);
}
