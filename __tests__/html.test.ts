import {
	getHtmlPage,
} from '../src/html/html.js';

describe('getHtmlPage', () => {
	it('returns a html page with the given content', () => {
		expect(getHtmlPage('title', 'content')).toBe('<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Oracle Health Dashboard</title><meta name="description" content="title"><link rel="stylesheet" href="static/bootstrap/css/bootstrap.min.css"><link rel="stylesheet" href="static/index.css"></head><body>content</body></html>');
		expect(getHtmlPage('title', ['content'])).toBe('<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Oracle Health Dashboard</title><meta name="description" content="title"><link rel="stylesheet" href="static/bootstrap/css/bootstrap.min.css"><link rel="stylesheet" href="static/index.css"></head><body>content</body></html>');
		expect(getHtmlPage('title', ['content'], 5)).toBe('<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Oracle Health Dashboard</title><meta name="description" content="title"><meta http-equiv="refresh" content="5" ><link rel="stylesheet" href="static/bootstrap/css/bootstrap.min.css"><link rel="stylesheet" href="static/index.css"></head><body>content</body></html>');
	});
});
