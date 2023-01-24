import {runServer} from './runServer';
import {runPing} from './runPing';
import {runGenDoc} from './runGenDoc';
import {runEncrypt} from './runEncrypt';
import {statsRemove} from './statsStore';
import {getCliOptions, commandType} from './options';

const main = async (): Promise<void> => {
	const options = getCliOptions();

	if (options.isInit) {
		statsRemove();
	}

	switch (options.command) {
		case commandType.start:
			await runServer(options);
			break;

		case commandType.ping:
			await runPing(options);
			break;

		case commandType.gendoc:
			runGenDoc(options);
			break;

		case commandType.encrypt:
			console.log(`Generated encrypted configuration in file ${runEncrypt(options)}`);
			break;

		default:
			break;
	}
};

void main();
