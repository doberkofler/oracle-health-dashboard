import {
	isNumber,
	isInteger,
	isDate,
	distanceToString,
	inspect,
} from '../src/util/util.js';

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

describe('distanceToString', () => {
	it('returns a human readable relative date', () => {
		const currentDate = new Date(2022, 0, 4, 16, 0, 0, 0); // 2022-01-05 16:00:00,0
		const relativeDate = new Date(2022, 0, 4, 15, 0, 0, 0); // 2022-01-05 16:00:00,0

		expect(distanceToString(relativeDate, currentDate)).toBe('about 1 hour ago');
		expect(distanceToString(new Date())).toBe('less than a minute ago');
	});
});

describe('inspect', () => {
	it('returns a string representation', () => {
		expect(inspect(1)).toBe('1');
		expect(inspect([1])).toBe('[ 1 ]');
		expect(inspect({p:1})).toBe('{ p: 1 }');
	});
});
