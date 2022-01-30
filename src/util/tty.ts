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

export const writeStrtingOnColumn = (text: string, x: number): void => {
	process.stdout.cursorTo(x);
	process.stdout.clearLine(1);
	process.stdout.write(text);
};
