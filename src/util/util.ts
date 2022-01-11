import {formatDistance, isDate as _isDate, isValid} from 'date-fns';
import {inspect as _inspect} from 'util';

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
 *	Convert any value to a string
 *
 * @param {unknown} value - The value to be inspected
 * @param {number} [depth=10] - The depth
 * @returns {string} returns the string reprsentation
 */
export function inspect(value: unknown, depth = 10): string {
	return _inspect(value, false, depth, false);
}
