import debugModule from 'debug';
import {getHtmlPage} from '../../html/html.js';
import {flatten} from '../../config/flatten.js';
import {getConnectionAsString} from '../../database/oracle.js';
import React from 'react';
import ReactDOMServer from 'react-dom/server.js';

import type {configType} from '../../config/config.js';
import type {flattenedType} from '../../config/flatten.js';

const debug = debugModule('oracle-health-dashboard:handlerConfig');

const borderLine = '2px solid #ddd';

export function getPage(config: configType): string {
	debug('getPage');

	const rows = flatten(config.hosts);
	const app = ReactDOMServer.renderToString(<Page rows={rows} />);
	const html = getHtmlPage('Configuration', `<div id="root">${app}</div>`, {
		includeBootstrap: false,
	});

	return html;

	return getHtmlPage('Configuration', JSON.stringify(config));
}

const Page = ({rows}: {rows: flattenedType[]}): JSX.Element => {
	return (
		<table className="main" style={{borderCollapse: 'collapse', width: '100%'}}>
			<Header />
			{rows.map(row => <Row key={row.id.toString()} row={row} />)}
		</table>
	);
};

const Header = (): JSX.Element => {
	return (
		<tr>
			<HeaderColumn title="Host" width="25%" />
			<HeaderColumn title="Database" width="50%" />
			<HeaderColumn title="Schema" width="25%" />
		</tr>
	);
};

const HeaderColumn = ({title, width}: {title: string, width: string}): JSX.Element => {
	return (
		<th style={{width, padding: '8px', textAlign: 'left', backgroundColor: '#04AA6D', color: 'white', borderRight: borderLine}}>
			{title}
		</th>
	);
};

const Row = ({row}: {row: flattenedType}): JSX.Element => {
	return (
		<tr>
			<Host row={row} />
			<Database row={row} />
			<Schema row={row} />
		</tr>
	);
};

const Host = ({row}: {row: flattenedType}): JSX.Element | null => {
	if (row.hostSwitch) {
		return (
			<td rowSpan={row.hostSchemaCount} style={{borderBottom: borderLine, borderRight: borderLine, padding: '8px'}}>
				<h1>{row.hostName}</h1>
				<h3>Probing:&nbsp;{row.hostProbe ? 'On' : 'Off'}</h3>
			</td>
		);
	} else {
		return null;
	}
};

const Database = ({row}: {row: flattenedType}): JSX.Element | null => {
	if (row.databaseSwitch) {
		const connection = row.containerConnection ? `CDB:&nbsp;${getConnectionAsString(row.containerConnection)}<br/>PDB:&nbsp;${getConnectionAsString(row.databaseConnection)}` : getConnectionAsString(row.databaseConnection);

		return (
			<td rowSpan={row.databaseSchemaCount} style={{borderBottom: borderLine, borderRight: borderLine, padding: '8px'}}>
				<h2>{row.databaseName}</h2>
				{connection.toLocaleLowerCase()}
			</td>
		);
	} else {
		return null;
	}
};

const Schema = ({row}: {row: flattenedType}): JSX.Element => {
	const connection = getConnectionAsString(row.schemaConnection); 

	return (
		<td style={{borderBottom: borderLine, padding: '8px'}}>
			<h3>{row.schemaName}</h3>
			{connection.toLocaleLowerCase()}
		</td>
	);
};
