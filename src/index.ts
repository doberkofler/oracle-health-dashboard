import debugModule from 'debug';
import {spawn, Thread, Worker} from 'threads';
import express from 'express';
import compression from 'compression';
import {configLoad} from './config.js';
import {handlerDefault} from './router/handlerDefault.js';
import {handlerDebug} from './router/handlerDebug.js';
import {gathererInitialize} from './gatherer/gatherer.js';

import type {Gatherer} from './gatherer/gathererWorker';

const debug = debugModule('oracle-health-dashboard:index');

async function main() {
	// install signal event handler
	debug('install signal event handler');
	process.on('SIGTERM', shutDown);
	process.on('SIGINT', shutDown);

	// load configuration
	debug('load configuration');
	const config = configLoad();

	// initialize gatherer
	debug('initialize gatherer');
	await gathererInitialize(config);

	// start gatherer thread
	debug('start gatherer thread');
	const gatherer = await spawn<Gatherer>(new Worker('./gatherer/gathererWorker'));
	await gatherer(config);

	const app = express();

	app.use(compression());

	// "static" route
	app.use('/static', express.static('static'));

	// "default" route
	app.get('/', handlerDefault.bind(null, config));

	// "debug" route
	app.get('/debug', handlerDebug.bind(null, config));

	const server = app.listen(config.http_port, () => {
		console.log(`Listening at http://127.0.0.1:${config.http_port}`);
	});

	async function shutDown() {
		console.log('Received kill signal, shutting down gracefully');

		// terminate gataherer thread
		console.log('Stopping gatherer thread...');
		await Thread.terminate(gatherer);
		console.log('Stopped gatherer thread.');

		// close server
		console.log('Closing server connection...');
		server.close(() => {
			console.log('Closed server connections.');
			process.exit(0);
		});
	}
}

void main();

/*

// child.js
process.on("message", function (message) {
	console.log(`Message from main.js: ${message}`);
  });
  
  process.send("Nathan");
  The main process can accept the message from its child process by listening to the message event, similar to the close event above:
  
  // main.js
  const { fork } = require("child_process");
  
  console.log("Running main.js");
  console.log("Forking a new subprocess....");
  
  const child = fork("child.js");
  child.send(29);
  
  child.on("message", function (message) {
	console.log(`Message from child.js: ${message}`);
  });

  */
 