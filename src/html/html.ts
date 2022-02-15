import fs from 'fs';
import path from 'path';
import {isInteger} from '../util/util.js';

type optionsType = {
	style?: string,
	refreshSecs?: number,
};

/*
*	get html page
*/
export function getHtmlPage(title: string, content: string | string[], script: string | string[] = [], options?: optionsType): string {
	const html = [];
	const pageTitle = 'Oracle Health Dashboard' + (title.length > 0 ? ' - ' + title : '');
	const rootStyles = fs.readFileSync(path.resolve(__dirname, '../root.css'));

	html.push('<html lang="en">');
	html.push('<head>');
	html.push('<meta charset="UTF-8">');
	html.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
	html.push('<meta http-equiv="X-UA-Compatible" content="ie=edge">');
	html.push(`<title>${pageTitle}</title>`);
	html.push(`<meta name="description" content="${pageTitle}">`);
	if (options && isInteger(options.refreshSecs) && options.refreshSecs > 0) {
		html.push(`<meta http-equiv="refresh" content="${options.refreshSecs}" >`);
	}
	//html.push(		'<link rel="icon" href="static/favicon.ico">');
	html.push('<style>');
	html.push(rootStyles);
	if (options && typeof options.style === 'string' && options.style.length > 0) {
		html.push(options.style);
	}
	html.push('</style>');
	html.push(	'</head>');
	html.push('<body>');
	if (content.length > 0) {
		html.push(	typeof content === 'string' ? content : content.join(''));
	}
	if (script.length > 0) {
		html.push(	typeof script === 'string' ? getScriptTag(script) : script.map(getScriptTag).join(''));
	}
	html.push('</body>');
	html.push('</html>');

	return html.join('\n');
}

function getScriptTag(script: string): string {
	return `<script src="${script}" defer></script>`;
}
