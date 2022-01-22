import debugModule from 'debug';

const debug = debugModule('oracle-health-dashboard:shutdown');

export async function installShutdown(handler?: () => Promise<void>) {
	debug('installShutdown');

	// install signal event handler
	process.on('SIGTERM', () => void shutdown(handler));
	process.on('SIGINT', () => void shutdown(handler));
}

function shutdown(handler?: () => Promise<void>): void {
	console.log('Received kill signal, shutting down gracefully');

	if (handler) {
		handler().then(() => process.exit(0), () => process.exit(1));
	}

	process.exit(0);
}
