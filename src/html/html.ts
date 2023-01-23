import {isInteger} from '../util/util.js';

type htmlPageOptionsType = {
	style?: string,
	refreshSecs?: number,
};

type rootPageOptionsType = htmlPageOptionsType & {
	title: string,
	app: string,
	script: string,
	data?: unknown,
};

type CustomGlobalThisType = typeof globalThis & {__INITIAL_SSR_DATA__?: string};

const ssrDataAttributeName = '__INITIAL_SSR_DATA__';

const getScriptTag = (script: string): string => `<script src="${script}" defer></script>`;

/*
*	get html page
*/
export const getHtmlPage = (title: string, content: string | string[], script: string | string[] = [], options?: htmlPageOptionsType): string => {
	const html = [];
	const pageTitle = `Oracle Health Dashboard${title.length > 0 ? ` - ${title}` : ''}`;

	html.push('<html lang="en">');
	html.push('<head>');
	html.push('<meta charset="UTF-8">');
	html.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
	html.push('<meta http-equiv="X-UA-Compatible" content="ie=edge">');
	html.push(`<meta name="description" content="${pageTitle}">`);
	html.push(`<title>${pageTitle}</title>`);
	if (options && isInteger(options.refreshSecs) && options.refreshSecs > 0) {
		html.push(`<meta http-equiv="refresh" content="${options.refreshSecs}" >`);
	}
	//html.push('<link rel="icon" href="static/favicon.ico">');
	html.push('<style>');
	html.push('* {font-family: Arial, Helvetica, sans-serif;}');
	if (options && typeof options.style === 'string' && options.style.length > 0) {
		html.push(options.style);
	}
	html.push('</style>');
	html.push('</head>');
	html.push('<body>');
	if (content.length > 0) {
		html.push(typeof content === 'string' ? content : content.join('\n'));
	}
	if (script.length > 0) {
		html.push(typeof script === 'string' ? getScriptTag(script) : script.map(getScriptTag).join('\n'));
	}
	html.push('</body>');
	html.push('</html>');

	return html.join('\n');
};

/*
*	get root page
*/
export const getRootPage = (options: rootPageOptionsType): string => {
	const content: string[] = [];
	if ('data' in options) {
		content.push(`<script>globalThis.${ssrDataAttributeName} = \`${JSON.stringify(options.data)}\`;</script>`);
	}
	content.push(`<div id="root">${options.app}</div>`);

	const htmlOptions: htmlPageOptionsType = {};
	if ('style' in options) {
		htmlOptions.style = options.style;
	}
	if ('refreshSecs' in options) {
		htmlOptions.refreshSecs = options.refreshSecs;
	}

	return getHtmlPage(options.title, content, options.script, htmlOptions);
};

/*
*	get ssr data
*/
export const getDataSSR = <T>(): T => {
	const data = (globalThis as CustomGlobalThisType)[ssrDataAttributeName];

	if (typeof data !== 'string') {
		throw new Error(`No "${ssrDataAttributeName}" property found on window`);
	}
	
	return JSON.parse(data) as T;
};
