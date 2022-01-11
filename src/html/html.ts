import {isInteger} from '../util/util.js';

/*
*	get page
*/
export function getHtmlPage(title: string, content: string | Array<string>, refreshSecs?: number): string {
	const html = [];

	html.push('<html lang="en">');
	html.push(	'<head>');
	html.push(		'<meta charset="UTF-8">');
	html.push(		'<meta name="viewport" content="width=device-width, initial-scale=1.0">');
	html.push(		'<meta http-equiv="X-UA-Compatible" content="ie=edge">');
	html.push(		'<title>Oracle Health Dashboard</title>');
	html.push(		`<meta name="description" content="${title}">`);
	if (isInteger(refreshSecs) && refreshSecs > 0) {
		html.push(`<meta http-equiv="refresh" content="${refreshSecs}" >`);
	}
	/*
	html.push(		'<link rel="icon" href="static/favicon.ico">');
	*/
	html.push(		'<link rel="stylesheet" href="static/bootstrap/css/bootstrap.min.css">');
	html.push(		'<link rel="stylesheet" href="static/index.css">');
	html.push(	'</head>');
	html.push('<body>');
	html.push(	typeof content === 'string' ? content : content.join(''));
	html.push('</body>');
	html.push('</html>');

	return html.join('');
}
