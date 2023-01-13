import {
	isStringArray,
	isNumber,
	isInteger,
	isDate,
	numberToString,
	distanceToString,
	timestampToString,
	prettyFormat,
} from '../src/util/util';

describe('isStringArray', () => {
	it('returns true for arrays of strings', () => {
		expect(isStringArray([''])).toBe(true);
		expect(isStringArray(['1', '2'])).toBe(true);
		expect(isStringArray([0])).toBe(false);
		expect(isStringArray(['', 0])).toBe(false);

		expect(isStringArray(0)).toBe(false);
		expect(isStringArray(1)).toBe(false);
		expect(isStringArray(0.1)).toBe(false);
		expect(isStringArray(undefined)).toBe(false);
		expect(isStringArray('')).toBe(false);
		expect(isStringArray(NaN)).toBe(false);
		expect(isStringArray(null)).toBe(false);
		expect(isStringArray({})).toBe(false);
		expect(isStringArray([])).toBe(true);
		expect(isStringArray(true)).toBe(false);
		expect(isStringArray(false)).toBe(false);
		expect(isStringArray(new Date())).toBe(false);
	});
});

describe('isNumber', () => {
	it('returns true for numbers', () => {
		expect(isNumber(0)).toBe(true);
		expect(isNumber(1)).toBe(true);
		expect(isNumber(0.1)).toBe(true);
		expect(isNumber(undefined)).toBe(false);
		expect(isNumber('')).toBe(false);
		expect(isNumber(NaN)).toBe(false);
		expect(isNumber(null)).toBe(false);
		expect(isNumber({})).toBe(false);
		expect(isNumber([])).toBe(false);
		expect(isNumber(true)).toBe(false);
		expect(isNumber(false)).toBe(false);
		expect(isNumber(new Date())).toBe(false);
	});
});

describe('isInteger', () => {
	it('returns true for integers', () => {
		expect(isInteger(0)).toBe(true);
		expect(isInteger(1)).toBe(true);
		expect(isInteger(0.1)).toBe(false);
		expect(isInteger(undefined)).toBe(false);
		expect(isInteger('')).toBe(false);
		expect(isInteger(NaN)).toBe(false);
		expect(isInteger(null)).toBe(false);
		expect(isInteger({})).toBe(false);
		expect(isInteger([])).toBe(false);
		expect(isInteger(true)).toBe(false);
		expect(isInteger(false)).toBe(false);
		expect(isInteger(new Date())).toBe(false);
	});
});

describe('isDate', () => {
	it('returns true for integers', () => {
		expect(isDate(0)).toBe(false);
		expect(isDate(1)).toBe(false);
		expect(isDate(0.1)).toBe(false);
		expect(isDate(undefined)).toBe(false);
		expect(isDate('')).toBe(false);
		expect(isDate(NaN)).toBe(false);
		expect(isDate(null)).toBe(false);
		expect(isDate({})).toBe(false);
		expect(isDate([])).toBe(false);
		expect(isDate(true)).toBe(false);
		expect(isDate(false)).toBe(false);
		expect(isDate(new Date())).toBe(true);
	});
});

describe('numberToString', () => {
	it('returns a human readable number', () => {
		expect(numberToString(-1)).toBe('-1');
		expect(numberToString(0)).toBe('0');
		expect(numberToString(1)).toBe('1');
		expect(numberToString(0.006)).toBe('0.01');
	});
});

describe('distanceToString', () => {
	it('returns a human readable relative date', () => {
		const currentDate = new Date(2022, 0, 4, 16, 0, 0, 0); // 2022-01-04 16:00:00,0
		const relativeDate = new Date(2022, 0, 4, 15, 0, 0, 0); // 2022-01-04 15:00:00,0

		expect(distanceToString(relativeDate, currentDate)).toBe('about 1 hour ago');
		expect(distanceToString(new Date())).toBe('less than a minute ago');
	});
});

describe('dateToString', () => {
	it('returns a human readable timestamp', () => {
		expect(timestampToString(new Date(2022, 0, 4, 16, 1, 2, 3))).toBe('4 Jan 2022 16:01:02'); // 2022-01-04 16:00:00,0
	});
});

describe('prettyFormat', () => {
	it('returns a string representation', () => {
		expect(prettyFormat(1)).toBe('1');
		expect(prettyFormat([1])).toBe('Array [\n  1,\n]');
		expect(prettyFormat({p:1})).toBe('Object {\n  "p": 1,\n}');
	});
});
