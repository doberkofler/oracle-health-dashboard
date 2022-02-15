import {formatDistance, isDate as _isDate, isValid, format} from 'date-fns';
import {format as pretty_format} from 'pretty-format';

/**
 * Is the given value an array of "string"
 *
 * @param {unknown} value - The value to be checked
 * @returns {boolean} returns true if the value matches the type
 */
export function isStringArray(value: unknown): value is string[] {
	return Array.isArray(value) && value.every(e => typeof e === 'string');
}

/**
 * Is the given value a "Number"
 *
 * @param {unknown} value - The value to be checked
 * @returns {boolean} returns true if the value matches the type
 */
export function isNumber(value: unknown): value is number {
	return typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value);
}

/**
 *	Is the given value an integer
 *
 * @param {unknown} value - The value to be checked
 * @returns {boolean} returns true if the value matches the type
 */
export function isInteger(value: unknown): value is number {
	return isNumber(value) && value % 1 === 0;
}

/**
 * Is the given value a "Date"
 *
 * @param {unknown} value - The value to be checked
 * @returns {boolean} returns true if the value matches the type
 */
export function isDate(value: unknown): value is Date {
	return _isDate(value) && isValid(value);
}

/*
 *	Format a number as a human readable string
 *
 * @param {number} value - The number
 * @returns {boolean} returns a human readable string
 */
export function numberToString(value: number, precision = 2): string {
	const multiplier = 10 ** precision;
	const round = Math.round(value * multiplier) / multiplier;

	return round.toString();
}

/*
 *	Format a distance between dates a human readable string
 *
 * @param {Date} relativeDate - The relative date
 * @param {Date} currentDate - The current date
 * @returns {boolean} returns a human readable string of the time distance
 */
export function distanceToString(relativeDate: Date, currentDate = new Date()): string {
	return formatDistance(relativeDate, currentDate, {addSuffix: true});
}

/*
 *	Format a timestamp a human readable string
 *
 * @param {Date} date - The date
 * @returns {boolean} returns a human readable string
 */
export function timestampToString(date: Date): string {
	return format(date, 'd MMM yyyy HH:mm:ss');
}

/*
 *	Convert any value to a string
 *
 * @param {unknown} value - The value to be inspected
 * @param {number} [depth=10] - The depth
 * @returns {string} returns the string reprsentation
 */
export function prettyFormat(value: unknown): string {
	return pretty_format(value);
}
