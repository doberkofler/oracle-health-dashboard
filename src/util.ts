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
	return toString.call(value) === '[object Date]';
}
