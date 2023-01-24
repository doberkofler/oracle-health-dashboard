//import debugModule from 'debug';
import {connectionToString} from '../../connection';
import React from 'react';
import {DatabaseDetails, Details, addLine} from './DetabaseDetails';
import {Timestamp} from '../../../shared/components/Timestamp/index';

import type {flattenedType} from '../../flatten';

type detailType = {
	title: string,
	value: string,
	unit?: string,
};

type rowPropsType = {row: flattenedType};

//const debug = debugModule('oracle-health-dashboard:statuspage');

const borderLine = '2px solid #ddd';

export const StatusPage = ({rows}: {rows: flattenedType[]}): JSX.Element => {
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

const Row = ({row}: rowPropsType): JSX.Element => {
	return (
		<tr>
			<Host row={row} />
			<Database row={row} />
			<Schema row={row} />
		</tr>
	);
};

const Host = ({row}: rowPropsType): JSX.Element | null => {
	if (row.hostSwitch) {
		return (
			<td rowSpan={row.hostSchemaCount} style={{borderBottom: borderLine, borderRight: borderLine, padding: '8px'}}>
				<h1>{row.hostName}</h1>
				<h3>{'Probe: '}{row.hostProbe ? 'On' : 'Off'}</h3>
			</td>
		);
	} else {
		return null;
	}
};

const Database = ({row}: rowPropsType): JSX.Element | null => {
	const style: React.CSSProperties = {
		borderBottom: borderLine,
		borderRight: borderLine,
		padding: '8px',
	};

	if (row.stats.dynamic && !row.stats.dynamic.status.success) {
		style.backgroundColor = 'red';
	}

	if (row.databaseSwitch) {
		return (
			<td rowSpan={row.databaseSchemaCount} style={style}>
				<h2>{row.databaseName}
					<LastUpdate timestamp={row.stats.dynamic?.status.timestamp} />
				</h2>
				<DatabaseConnectionString row={row} />
				<DatabaseDetails row={row} />
			</td>
		);
	} else {
		return null;
	}
};

const Schema = ({row}: rowPropsType): JSX.Element => {
	const data: detailType[] = [];

	const style: React.CSSProperties = {
		borderBottom: borderLine,
		padding: '8px',
	};

	if (row.stats.dynamic?.schema) {
		const schema = row.stats.dynamic.schema;

		if (!schema.status.success) {
			style.backgroundColor = 'red';
		}

		// custom metrics
		schema.custom.forEach(e => {
			addLine(data, e.title, e.value);
		});
	}

	const connection = connectionToString(row.schemaConnection);

	return (
		<td style={style}>
			<h3>
				{row.schemaName}
				<LastUpdate timestamp={row.stats.dynamic?.schema?.status.timestamp} />
			</h3>
			<h5>
				{connection.toLocaleLowerCase()}
			</h5>
			<Details data={data} />
		</td>
	);
};

const HeaderColumn = ({title, width}: {title: string, width: string}): JSX.Element => {
	return (
		<th style={{width, padding: '8px', textAlign: 'left', backgroundColor: '#04AA6D', color: 'white', borderRight: borderLine}}>
			{title}
		</th>
	);
};

const DatabaseConnectionString = ({row}: rowPropsType): JSX.Element => {
	if (row.containerConnection) {
		return (
			<h5>
				{`CDB: ${connectionToString(row.containerConnection).toLocaleLowerCase()}`}
				<br />
				{`PDB: ${connectionToString(row.databaseConnection).toLocaleLowerCase()}`}
			</h5>
		);
	} else {
		return (
			<h5>
				{connectionToString(row.databaseConnection).toLocaleLowerCase()}
			</h5>
		);
	}

};

const LastUpdate = ({timestamp}: {timestamp?: Date}): JSX.Element | null => {
	if (timestamp) {
		return (
			<span className="timestamp">
				{'Last updated '}
				<Timestamp timestamp={timestamp} />
			</span>
		);
	} else {
		return null;
	}
};
