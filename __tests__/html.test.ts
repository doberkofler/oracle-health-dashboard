import {getHtmlPage} from '../src/shared/util/html';

describe('getHtmlPage', () => {
	it('returns a html page with the given content', () => {
		expect(getHtmlPage('', '', [], {})).toBe([
			'<html lang="en">',
			'<head>',
			'<meta charset="UTF-8">',
			'<meta name="viewport" content="width=device-width, initial-scale=1.0">',
			'<meta http-equiv="X-UA-Compatible" content="ie=edge">',
			'<meta name="description" content="Oracle Health Dashboard">',
			'<title>Oracle Health Dashboard</title>',
			'<style>',
			'* {font-family: Arial, Helvetica, sans-serif;}',
			'</style>',
			'</head>',
			'<body>',
			'</body>',
			'</html>',
		].join('\n'));

		expect(getHtmlPage('title', 'content', [], {})).toBe([
			'<html lang="en">',
			'<head>',
			'<meta charset="UTF-8">',
			'<meta name="viewport" content="width=device-width, initial-scale=1.0">',
			'<meta http-equiv="X-UA-Compatible" content="ie=edge">',
			'<meta name="description" content="Oracle Health Dashboard - title">',
			'<title>Oracle Health Dashboard - title</title>',
			'<style>',
			'* {font-family: Arial, Helvetica, sans-serif;}',
			'</style>',
			'</head>',
			'<body>',
			'content',
			'</body>',
			'</html>',
		].join('\n'));
	});
});
