export const write = (text: string): void => {
	process.stdout.write(text);
};

export const writeNewLine = (text = ''): void => {
	process.stdout.write(text + '\n');
};

export const writeAfterEraseLine = (text: string): void => {
	process.stdout.clearLine(0);
	process.stdout.cursorTo(0);
	process.stdout.write(text);
};

export const writeStartingOnColumn = (text: string, x: number): void => {
	process.stdout.cursorTo(x);
	process.stdout.clearLine(1);
	process.stdout.write(text);
};

export const log = (text: string): void => {
	console.log(`[${new Date().toJSON()}] ${text}`);
};

export const warn = (text: string): void => {
	console.warn(`[${new Date().toJSON()}] ${text}`);
};
