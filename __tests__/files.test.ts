import os from 'os';
import path from 'path';
import fs from 'fs';
import {
	jsonSave,
	jsonLoad,
	textLoad,
	textSave,
} from '../src/util/files';

const tempFilename = path.join(os.tmpdir(), 'test.tmp');
const someDate = new Date(1995, 11, 17, 3, 24, 0);

describe('textSave', () => {
	it('writes a string to a file', () => {
		expect(() => {
			textSave(tempFilename, 'magic');
		}).not.toThrow();
	});
});

describe('textLoad', () => {
	it('reads the content of a file into a string', () => {
		const data = textLoad(tempFilename);
		expect(data).toBe('magic');
	});

	it('throws an error when file does not esist', () => {
		fs.unlinkSync(tempFilename);
		expect(() => {
			textLoad(tempFilename);
		}).toThrow(`The file "${tempFilename}" cannot be read`);
	});
});

describe('jsonSave', () => {
	it('saves a values in json format to a file', () => {
		createJsonFile();
		expect(textLoad(tempFilename)).toBe(`{"str":"str","num":0.1,"boo":true,"dat":"${someDate.toJSON()}","nul":null}`);
	});
});

describe('jsonLoad', () => {
	it('loads a json file and parses it', () => {
		const data = jsonLoad<Record<string, unknown>>(tempFilename);

		expect(data.str).toBe('str');
		expect(data.num).toBe(0.1);
		expect(data.boo).toBe(true);
		expect(data.dat).toBeInstanceOf(Date);
		expect((data.dat as Date).getTime()).toBe(someDate.getTime());
		expect(data.nul).toBeNull();
	});

	it('loads a json file with the Microsoft Date format and parses it', () => {
		textSave(tempFilename, `{"dat":"/Date(${someDate.getTime()})/"}`);
		const data = jsonLoad<{dat: Date}>(tempFilename);
		expect(data.dat.getTime()).toBe(someDate.getTime());
	});

	it('throws an error when loading am invalid json file', () => {
		fs.unlinkSync(tempFilename);
		fs.writeFileSync(tempFilename, 'a:a');
		expect(textLoad(tempFilename)).toBe('a:a');
		expect(() => {
			jsonLoad(tempFilename);
		}).toThrow(`The content "a:a" of the file "${tempFilename}" is not valid json`);
	});
});

function createJsonFile(): void {
	jsonSave(tempFilename, {
		str: 'str',
		num: 0.1,
		boo: true,
		dat: someDate,
		nul: null,
	});
}
