import {isDate, toJSON, fromJSONWeak} from './date';

/*
*	replacer
*/
export function replacer(key: string, value: unknown): unknown {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-expect-error
	return isDate(this[key]) ? toJSON(this[key]) : value; // eslint-disable-line @typescript-eslint/no-invalid-this, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
}

/*
*	reviver
*/
export function reviver(_key: string, value: unknown): unknown {
	const date = fromJSONWeak(value);

	return date ?? value;
}

/**
*	custom stringify function to treat date values differently
*/
export const stringify = (value: unknown): string => JSON.stringify(value, replacer);

/**
*	custom parse function to treat date values differently
*/
export const parse = (value: string): unknown => JSON.parse(value, reviver);
