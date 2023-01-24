import {isDate, toJSON, fromJSON, dateToHumanizedString, fromJSONWeak} from '../src/shared/util/date';

describe('date', () => {
	it('isDate', () => {
		expect.hasAssertions();

		[
			{value: undefined, expect: false},
			{value: null, expect: false},
			{value: 0, expect: false},
			{value: false, expect: false},
			{value: true, expect: false},
			{value: {}, expect: false},
			{value: [], expect: false},
			{value: '', expect: false},
			{value: '2016-09-30T00:00:00', expect: false},
			{value: new Date(), expect: true},
		].forEach(test => {
			expect(isDate(test.value)).toBe(test.expect);
		});
	});

	it('toJSON and fromJSON', () => {
		expect.hasAssertions();

		[
			{value: new Date(2016,	9 - 1,	30), expect: '2016-09-30T00:00:00'},
			{value: new Date(2016,	10 - 1,	30), expect: '2016-10-30T00:00:00'},
			{value: new Date(2016,	11 - 1,	30), expect: '2016-11-30T00:00:00'},
			{value: new Date(2015,	6 - 1,	1), expect: '2015-06-01T00:00:00'},
			{value: new Date(2015,	1 - 1,	1), expect: '2015-01-01T00:00:00'},
			{value: new Date(2015,	12 - 1,	31), expect: '2015-12-31T00:00:00'},
			{value: new Date(2015,	6 - 1,	1,	1,	2,	3), expect: '2015-06-01T01:02:03'},
			{value: new Date(2015,	1 - 1,	1,	0,	1,	2), expect: '2015-01-01T00:01:02'},
			{value: new Date(2015,	12 - 1,	31,	23,	59,	59), expect: '2015-12-31T23:59:59'}
		].forEach(test => {
			expect(toJSON(test.value)).toStrictEqual(test.expect);
			expect(fromJSON(test.expect)).toStrictEqual(test.value);
		});

		[null, undefined, 'string', 4711, true].forEach(value => {
			expect(() => {
				fromJSON(value as string);
			}).toThrow();
		});

		expect(() => toJSON({} as Date)).toThrow();
	});

	it('fromJSONWeak', () => {
		expect.hasAssertions();

		[
			undefined,
			null,
			0,
			false,
			true,
			{},
			[],
			'',
			'2016-13-30T00:00:00',
			new Date(),
		].forEach(test => {
			expect(fromJSONWeak(test)).toBeNull();
		});

		expect(fromJSONWeak('2016-09-30T00:00:00')).not.toBeNull();
	});

	it('dateToHumanizedString', () => {
		expect.hasAssertions();

		const now = new Date(2019, 0, 1, 0, 0, 0, 0); // 2019-01-01 00:00:00
		const tests = [
			/* eslint-disable no-multi-spaces */
			{date: new Date(2021,  0,  1,  0,  0,  0, 0), en: 'in about 2 years', de: 'in etwa 2 Jahren'},
			{date: new Date(2020,  0,  1,  0,  0,  0, 0), en: 'in about 1 year', de: 'in etwa 1 Jahr'},
			{date: new Date(2019,  2,  1,  0,  0,  0, 0), en: 'in about 2 months', de: 'in etwa 2 Monaten'},
			{date: new Date(2019,  1,  1,  0,  0,  0, 0), en: 'in about 1 month', de: 'in etwa 1 Monat'},
			{date: new Date(2019,  0,  3,  0,  0,  0, 0), en: 'in 2 days', de: 'in 2 Tagen'},
			{date: new Date(2019,  0,  2,  0,  0,  0, 0), en: 'in 1 day', de: 'in 1 Tag'},
			{date: new Date(2019,  0,  1,  2,  0,  0, 0), en: 'in about 2 hours', de: 'in etwa 2 Stunden'},
			{date: new Date(2019,  0,  1,  1,  0,  0, 0), en: 'in about 1 hour', de: 'in etwa 1 Stunde'},
			{date: new Date(2019,  0,  1,  0,  2,  0, 0), en: 'in 2 minutes', de: 'in 2 Minuten'},
			{date: new Date(2019,  0,  1,  0,  1,  0, 0), en: 'in 1 minute', de: 'in 1 Minute'},
			{date: new Date(2019,  0,  1,  0,  0, 30, 0), en: 'in 1 minute', de: 'in 1 Minute'},
			{date: new Date(2019,  0,  1,  0,  0,  2, 0), en: 'in less than a minute', de: 'in weniger als 1 Minute'},
			{date: new Date(2019,  0,  1,  0,  0,  1, 0), en: 'in less than a minute', de: 'in weniger als 1 Minute'},
			{date: new Date(2019,  0,  1,  0,  0,  0, 0), en: 'less than a minute ago', de: 'vor weniger als 1 Minute'}, // now
			{date: new Date(2018, 11, 31, 23, 59, 59, 0), en: 'less than a minute ago', de: 'vor weniger als 1 Minute'},
			{date: new Date(2018, 11, 31, 23, 59, 58, 0), en: 'less than a minute ago', de: 'vor weniger als 1 Minute'},
			{date: new Date(2018, 11, 31, 23, 59, 30, 0), en: '1 minute ago', de: 'vor 1 Minute'},
			{date: new Date(2018, 11, 31, 23, 58, 59, 0), en: '1 minute ago', de: 'vor 1 Minute'},
			{date: new Date(2018, 11, 31, 23, 57, 59, 0), en: '2 minutes ago', de: 'vor 2 Minuten'},
			{date: new Date(2018, 11, 31, 23,  0,  0, 0), en: 'about 1 hour ago', de: 'vor etwa 1 Stunde'},
			{date: new Date(2018, 11, 31, 22,  0,  0, 0), en: 'about 2 hours ago', de: 'vor etwa 2 Stunden'},
			{date: new Date(2018, 11, 31,  0,  0,  0, 0), en: '1 day ago', de: 'vor 1 Tag'},
			{date: new Date(2018, 11, 30,  0,  0,  0, 0), en: '2 days ago', de: 'vor 2 Tagen'},
			/* eslint-enable no-multi-spaces */
		];

		// US
		tests.forEach(test => {
			expect(dateToHumanizedString(test.date, now)).toStrictEqual(test.en);
		});

		expect(() => dateToHumanizedString({} as Date)).toThrow();
	});
});
