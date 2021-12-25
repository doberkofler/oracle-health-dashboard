import {
	isNumber,
	isInteger,
	isDate,
} from '../src/util.js';

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
