import {isInteger} from '../util/util.js';

type optionsType = {
	style?: string,
	includeBootstrap?: boolean,
	refreshSecs?: number,
};

/*
*	get page
*/
export function getHtmlPage(title: string, content: string | Array<string>, options?: optionsType): string {
	const html = [];

	html.push('<html lang="en">');
	html.push('<head>');
	html.push('<meta charset="UTF-8">');
	html.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
	html.push('<meta http-equiv="X-UA-Compatible" content="ie=edge">');
	if (title.length > 0) {
		html.push(`<title>${title}</title>`);
		html.push(`<meta name="description" content="${title}">`);
	}
	if (options && isInteger(options.refreshSecs) && options.refreshSecs > 0) {
		html.push(`<meta http-equiv="refresh" content="${options.refreshSecs}" >`);
	}
	/*
	html.push(		'<link rel="icon" href="static/favicon.ico">');
	*/
	if (options && options.includeBootstrap !== false) {
		html.push('<link rel="stylesheet" href="static/bootstrap/css/bootstrap.min.css">');
	}
	html.push('<link rel="stylesheet" href="static/index.css">');
	if (options && typeof options.style === 'string' && options.style.length > 0) {
		html.push('<style>');
		html.push(options.style);
		html.push('</style>');
	}
	html.push(	'</head>');
	html.push('<body>');
	if (content.length > 0) {
		html.push(	typeof content === 'string' ? content : content.join(''));
	}
	html.push('</body>');
	html.push('</html>');

	return html.join('\n');
}
