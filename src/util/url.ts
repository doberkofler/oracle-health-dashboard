/**
*	Join 2 url's together
*/
export const join = (first: string, second: string): string => {
	const firstTrim = first.trim().replace(/\/+$/g, '');
	const secondTrim = second.trim().replace(/^\/+/g, '');

	let url = firstTrim;
	if (url.length > 0 && secondTrim.length > 0) {
		url += '/';
	}

	return url + secondTrim;
};
