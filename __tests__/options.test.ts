import {getOptions} from '../src/options.js';

describe('getOptions', () => {
	it('returns an object with the command line arguments', () => {
		[
			[[], {config: 'config.json', ping: false}],
			[['--config=a.json', '--ping'], {config: 'a.json', ping: true}],
		].forEach(test => {
			const args = test[0] as string[];
			const argv = ['', ''].concat(args);

			expect(getOptions(argv)).toStrictEqual(test[1]);
		});
	});
});
