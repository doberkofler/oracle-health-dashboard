import debugModule from 'debug';
import path from 'path';
import {textLoad, textSave} from '../util/files.js';
import {encrypt} from '../util/encryption.js';
import {installShutdown} from '../shutdown.js';

const debug = debugModule('oracle-health-dashboard:runEncrypt');

export function runEncrypt(configFilename: string, encryptionKey: string): void {
	debug('runEncrypt', configFilename);

	// install shutdown handler
	installShutdown();

	// load configuration
	debug('load configuration file');
	const content = textLoad(configFilename);

	// encrypt
	const encryptedContent = encrypt(Buffer.from(content), encryptionKey);

	// save configuration
	const extension = path.extname(configFilename);
	const filename = path.basename(configFilename, extension) + '-encrypted' + extension;
	textSave(filename, encryptedContent.toString('base64'));
	console.log(`Generated encrypted configuration in file ${filename}`);
}
