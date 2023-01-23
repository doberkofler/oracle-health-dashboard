import debugModule from 'debug';
import path from 'path';
import {textLoad, textSave} from '../util/files';
import {encrypt} from '../util/encryption';
import {installShutdown} from '../shutdown';

import type {cliOptionsType} from '../cli/options';

const debug = debugModule('oracle-health-dashboard:runEncrypt');

export function runEncrypt(options: cliOptionsType): string {
	debug('runEncrypt', options);

	// install shutdown handler
	installShutdown();

	// load configuration
	debug('load configuration file');
	const content = textLoad(options.config);

	// encrypt
	const encryptedContent = encrypt(Buffer.from(content), options.encryptionKey);

	// save configuration
	const extension = path.extname(options.config);
	const filename = `${path.basename(options.config, extension)}-encrypted${extension}`;
	textSave(filename, encryptedContent.toString('base64'));

	return filename;
}
