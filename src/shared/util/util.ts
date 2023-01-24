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

/**
 * Convert a string to a number
 *
 * @param value - The string to convert
 * @returns The number
 * @example
 *	stringToNumber(0) -> 0
 *	stringToNumber(NaN) -> throws TypeError
 *	stringToNumber('0') -> 0
 *	stringToNumber('-1.1') -> -1.1
 *	stringToNumber('') -> throws TypeError
 *	stringToNumber(' 1') -> throws TypeError
 *	stringToNumber('1 ') -> throws TypeError
 */
export function stringToNumber(value: string | number): number {
	const num = stringToNumberWeak(value);

	if (num === null) {
		throw new TypeError(`"${value}" is not a number`);
	}

	return num;
}

/**
 * Convert a string to a number
 *
 * @param value - The string to convert
 * @returns The number or null if the string could not be converted
 * @example
 *	stringToNumberWeak(0) -> 0
 *	stringToNumberWeak(NaN) -> null
 *	stringToNumberWeak('0') -> 0
 *	stringToNumberWeak('-1.1') -> -1.1
 *	stringToNumberWeak('') -> null
 *	stringToNumberWeak(' 1') -> null
 *	stringToNumberWeak('1 ') -> null
 */
export function stringToNumberWeak(value: string | number): number | null {
	// is the value already of type number?
	if (typeof value === 'number') {
		return !Number.isNaN(value) && Number.isFinite(value) ? value : null;
	}

	// Test for invalid characters
	if (!/^[+-]?\d*\.?\d+(?:[Ee][+-]?\d+)?$/.test(value)) {
		return null;
	}

	// Convert value to a number
	const num = Number(value);
	return Number.isNaN(num) ? null : num;
}

/**
 * Convert a string to a integer
 *
 * @param value - The string to convert
 * @returns The integer
 * @example
 *	stringToInteger(0) -> 0
 *	stringToInteger(NaN) -> throws TypeError
 *	stringToInteger('0') -> 0
 *	stringToInteger('-1.1') -> throws TypeError
 *	stringToInteger('') -> throws TypeError
 *	stringToInteger(' 1') -> throws TypeError
 *	stringToInteger('1 ') -> throws TypeError
 */
export function stringToInteger(value: string | number): number {
	const num = stringToIntegerWeak(value);

	if (num === null) {
		throw new TypeError(`"${value}" is not a number`);
	}

	return num;
}

/**
 * Convert a string to a integer
 *
 * @param value - The string to convert
 * @returns The integer or null if the string could not be converted
 * @example
 *	stringToIntegerWeak(0) -> 0
 *	stringToIntegerWeak(NaN) -> null
 *	stringToIntegerWeak('0') -> 0
 *	stringToIntegerWeak('-1.1') -> null
 *	stringToIntegerWeak('') -> null
 *	stringToIntegerWeak(' 1') -> null
 *	stringToIntegerWeak('1 ') -> null
 */
export function stringToIntegerWeak(value: string | number): number | null {
	// is the value already a "real" integer, we just return the value
	if (typeof value === 'number' && Number.isInteger(value)) {
		return value;
	}

	// try to convert value to a number
	const num = stringToNumberWeak(value);
	if (num === null || !Number.isInteger(num)) {
		return null;
	}

	return num;
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
