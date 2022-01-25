import debugModule from 'debug';
import {getHtmlPage} from '../../html/html.js';
import React from 'react';
import ReactDOMServer from 'react-dom/server.js';

import type {configType, databaseType} from '../../config.js';
import type {connectionOptionsType} from '../../gatherer/oracle.js';

type enhancedDatabaseType = databaseType & {
	hostSwitch: boolean,
	hostSchemaCount: number,
	databaseSwitch: boolean,
	databaseSchemaCount: number,
};

const debug = debugModule('oracle-health-dashboard:handlerConfig');

const borderLine = '2px solid #ddd';

/*
*	get page
*/
export function getPage(config: configType): string {
	debug('getPage');

	const databases = enhanceDatabases(config.databases);
	const app = ReactDOMServer.renderToString(<Page databases={databases} />);
	const html = getHtmlPage('Configuration', `<div id="root">${app}</div>`, {
		includeBootstrap: false,
	});

	return html;
}

const Page = ({databases}: {databases: enhancedDatabaseType[]}): JSX.Element => {
	return (
		<table className="main" style={{borderCollapse: 'collapse', width: '100%'}}>
			<Header />
			{databases.map(database => <Row key={database.id.toString()} database={database} />)}
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

const Row = ({database}: {database: enhancedDatabaseType}): JSX.Element => {
	return (
		<tr>
			<Host database={database} />
			<Database database={database} />
			<Schema database={database} />
		</tr>
	);
};

const Host = ({database}: {database: enhancedDatabaseType}): JSX.Element | null => {
	if (database.hostSwitch) {
		return (
			<td rowSpan={database.hostSchemaCount} style={{borderBottom: borderLine, borderRight: borderLine, padding: '8px'}}>
				<h1>{database.hostName}</h1>
			</td>
		);
	} else {
		return null;
	}
};

const Database = ({database}: {database: enhancedDatabaseType}): JSX.Element | null => {
	if (database.databaseSwitch) {
		const cdb = getConnection(database.cdbConnect);
		const pdb = getConnection(database.pdbConnect);
	
		let connection;
		if (cdb === pdb) {
			connection = cdb;
		} else {
			connection = 'CDB:&nbsp;' + cdb + '<br/>' + 'PDB:&nbsp;' + pdb;
		}

		return (
			<td rowSpan={database.databaseSchemaCount} style={{borderBottom: borderLine, borderRight: borderLine, padding: '8px'}}>
				<h2>{database.databaseName}</h2>
				{connection.toLocaleLowerCase()}
			</td>
		);
	} else {
		return null;
	}
};

const Schema = ({database}: {database: enhancedDatabaseType}): JSX.Element => {
	const connection = getConnection(database.schemaConnect); 

	return (
		<td style={{borderBottom: borderLine, padding: '8px'}}>
			<h3>{database.schemaName}</h3>
			{connection.toLocaleLowerCase()}
		</td>
	);
};

const getConnection = (connection: connectionOptionsType): string => {
	return `${connection.username}/${connection.password}@${connection.connection}`;
};

const enhanceDatabases = (databases: databaseType[]): enhancedDatabaseType[] => {
	const sortedDatabases = databases.sort(compareDatabase);

	let lastHostName = '';
	let lastDatabaseName = '';

	return sortedDatabases.map(database => {
		let hostSwitch = false;
		let hostSchemaCount = 0;
		let databaseSwitch = false;
		let databaseSchemaCount = 0;

		if (database.hostName !== lastHostName) {
			lastHostName = database.hostName;
			lastDatabaseName = '';

			hostSwitch = true;
			hostSchemaCount = sortedDatabases.filter(e => e.hostName === database.hostName).length;
		}
		
		if (database.databaseName !== lastDatabaseName) {
			lastDatabaseName = database.databaseName;

			databaseSwitch = true;
			databaseSchemaCount = sortedDatabases.filter(e => e.hostName === database.hostName && e.databaseName === database.databaseName).length;
		}

		return {...database, hostSwitch, hostSchemaCount, databaseSwitch, databaseSchemaCount};
	});
};

const compareDatabase = (a: databaseType, b: databaseType): number => {
	if (a.hostName != b.hostName) {
		return a.hostName.localeCompare(b.hostName);
	} if (a.databaseName != b.databaseName) {
		return a.databaseName.localeCompare(b.databaseName);
	} else {
		return a.schemaName.localeCompare(b.schemaName);
	}
};
