import express from 'express';
import debugModule from 'debug';
import {buildTree} from '../config.js';
import {getHtmlPage} from '../html/html.js';
import React from 'react';
import ReactDOMServer from 'react-dom/server.js';

import type {configType, treeHostType, treeDatabaseType, treeSchemaType} from '../config.js';

const debug = debugModule('oracle-health-dashboard:handlerConfig');

const style = `
* {
	font-family: Arial, Helvetica, sans-serif;
}

table {
	border-collapse: collapse;
	width: 100%;
}

td, th {
	border: 1px solid #ddd;
	padding: 8px;
}
	
th {
	padding-top: 12px;
	padding-bottom: 12px;
	text-align: left;
	background-color: #04AA6D;
	color: white;
}
`;

/*
*	handler "default"
*/
export async function handlerConfig(config: configType, _req: express.Request, res: express.Response): Promise<express.Response> {
	debug('"handlerConfig');

	const hosts = buildTree(config.databases);
	const app = ReactDOMServer.renderToString(<Page hosts={hosts} />);
	const html = getHtmlPage('Configuration', `<div id="root">${app}</div>`, {
		includeBootstrap: false,
		style,
	});

	// set header and status
	res.contentType('text/html');
	res.status(200);
		
	return res.send(html);
}

type PropsPageType = {
	hosts: treeHostType[],
};

const Page = ({
	hosts,
}: PropsPageType): JSX.Element => {
	return (
		<table className="hosts">
			{hosts.map(host => <Host host={host} />)}
		</table>
	);
};

type PropsHostType = {
	host: treeHostType,
};

const Host = ({
	host
}: PropsHostType): JSX.Element => {
	return (
		<tr>
			<td>
				Host:&nbsp;{host.name}
			</td>
			<td>
				<table className="databases">
					{host.databases.map(database => <Database database={database} />)}
				</table>
			</td>
		</tr>
	);
};

type PropsDatabaseType = {
	database: treeDatabaseType,
};

const Database = ({
	database
}: PropsDatabaseType): JSX.Element => {
	return (
		<tr>
			<td>
				Database:&nbsp;{database.name}
			</td>
			<td>
				<table className="schemas">
					{database.schemas.map(schema => <Schema schema={schema} />)}
				</table>
			</td>
		</tr>
	);
};

type PropsSchemaType = {
	schema: treeSchemaType,
};

const Schema = ({
	schema
}: PropsSchemaType): JSX.Element => {
	return (
		<tr>
			<td>
				Schema:&nbsp;{schema.name}
			</td>
		</tr>
	);
};
