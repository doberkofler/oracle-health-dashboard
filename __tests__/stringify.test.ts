import {stringify, parse} from '../src/shared/util/stringify';
import {toJSON} from '../src/shared/util/date';

const tests = (): {value: unknown, stringified: string}[] => {
	const dateA = new Date(2023, 0, 1, 1, 2, 3, 0); // 1-JAN-2023 01:02:03,0
	const dateB = new Date(2023, 0, 1, 0, 0, 0, 0); // 1-JAN-2023 00:00:00,0

	return [
		{value: null, stringified: 'null'},
		{value: '', stringified: '""'},
		{value: 0, stringified: '0'},
		{value: true, stringified: 'true'},
		{value: false, stringified: 'false'},
		{value: {}, stringified: '{}'},
		{value: [], stringified: '[]'},
		{value: {a: 'a'}, stringified: '{"a":"a"}'},
		{value: ['a'], stringified: '["a"]'},
		{value: dateA, stringified: `"${toJSON(dateA)}"`},
		{value: dateB, stringified: `"${toJSON(dateB)}"`},
		{value: [{now: dateA}], stringified: `[{"now":"${toJSON(dateA)}"}]`},
		{value: dateA, stringified: `"${toJSON(dateA)}"`},
	];
};

describe('stringify', () => {
	it('stringify shoud stringify a value', () => {
		expect.hasAssertions();

		tests().forEach(test => {
			expect(stringify(test.value)).toStrictEqual(test.stringified);
		});
	});

	it('parse shoud parse a value', () => {
		expect.hasAssertions();

		tests().forEach(test => {
			expect(parse(test.stringified)).toStrictEqual(test.value);
		});
	});
});
