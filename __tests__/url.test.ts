import {join} from '../src/util/url';

describe('combineURLs', () => {
	it('should combine two urls', () => {
		expect.hasAssertions();

		[
			{first: 'base', second: 'relative', expected: 'base/relative'},
			{first: ' //base ', second: ' relative// ', expected: '//base/relative//'},
			{first: 'base/', second: 'relative', expected: 'base/relative'},
			{first: 'base', second: '/relative', expected: 'base/relative'},
			{first: 'base/', second: '/relative', expected: 'base/relative'},
			{first: 'base//', second: '//relative', expected: 'base/relative'},
			{first: '//base//', second: '//relative//', expected: '//base/relative//'},
			{first: '', second: 'relative', expected: 'relative'},
			{first: 'base', second: '', expected: 'base'},
			{first: '', second: '', expected: ''},
		].forEach(test => {
			const {first, second, expected} = test;
			expect(join(first, second)).toBe(expected);
		});
	});
});
