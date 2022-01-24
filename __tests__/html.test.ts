import {
	getHtmlPage,
} from '../src/html/html.js';

describe('getHtmlPage', () => {
	it('returns a html page with the given content', () => {
		expect(getHtmlPage('', '', {includeBootstrap: false})).toBe([
			'<html lang="en">',
			'<head>',
			'<meta charset="UTF-8">',
			'<meta name="viewport" content="width=device-width, initial-scale=1.0">',
			'<meta http-equiv="X-UA-Compatible" content="ie=edge">',
			'<title>Oracle Health Dashboard</title>',
			'<meta name="description" content="Oracle Health Dashboard">',
			'<link rel="stylesheet" href="static/index.css">',
			'</head>',
			'<body>',
			'</body>',
			'</html>',
		].join('\n'));

		expect(getHtmlPage('title', 'content', {includeBootstrap: false})).toBe([
			'<html lang="en">',
			'<head>',
			'<meta charset="UTF-8">',
			'<meta name="viewport" content="width=device-width, initial-scale=1.0">',
			'<meta http-equiv="X-UA-Compatible" content="ie=edge">',
			'<title>Oracle Health Dashboard - title</title>',
			'<meta name="description" content="Oracle Health Dashboard - title">',
			'<link rel="stylesheet" href="static/index.css">',
			'</head>',
			'<body>',
			'content',
			'</body>',
			'</html>',
		].join('\n'));

		expect(getHtmlPage('title', 'content', {refreshSecs: 5, style: '.class {color: red;}'})).toBe([
			'<html lang="en">',
			'<head>',
			'<meta charset="UTF-8">',
			'<meta name="viewport" content="width=device-width, initial-scale=1.0">',
			'<meta http-equiv="X-UA-Compatible" content="ie=edge">',
			'<title>Oracle Health Dashboard - title</title>',
			'<meta name="description" content="Oracle Health Dashboard - title">',
			'<meta http-equiv="refresh" content="5" >',
			'<link rel="stylesheet" href="static/bootstrap/css/bootstrap.min.css">',
			'<link rel="stylesheet" href="static/index.css">',
			'<style>',
			'.class {color: red;}',
			'</style>',
			'</head>',
			'<body>',
			'content',
			'</body>',
			'</html>',
		].join('\n'));
	});
});
