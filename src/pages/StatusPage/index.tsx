//import debugModule from 'debug';
import {numberToString, timestampToString, isDate, distanceToString} from '../../util/util.js';
import {getConnectionAsString} from '../../database/oracle.js';
import React from 'react';

import type {flattenedType} from '../../config/flatten.js';

type rowType = {
	row: flattenedType,
	showPassword: boolean,
};

//const debug = debugModule('oracle-health-dashboard:statuspage');

const borderLine = '2px solid #ddd';

export const StatusPage = ({rows, showPassword}: {rows: flattenedType[], showPassword: boolean}): JSX.Element => {
	return (
		<table className="main" style={{borderCollapse: 'collapse', width: '100%'}}>
			<Header />
			{rows.map(row => <Row key={row.id.toString()} row={row} showPassword={showPassword} />)}
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

const Row = ({row, showPassword}: rowType): JSX.Element => {
	return (
		<tr>
			<Host row={row} />
			<Database row={row} showPassword={showPassword} />
			<Schema row={row} showPassword={showPassword} />
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

const Database = ({row, showPassword}: rowType): JSX.Element | null => {
	if (row.databaseSwitch) {
		return (
			<td rowSpan={row.databaseSchemaCount} style={{borderBottom: borderLine, borderRight: borderLine, padding: '8px'}}>
				<h2>{row.databaseName}<LastUpdate row={row}/></h2>
				<DatabaseConnectionString row={row} showPassword={showPassword} />
				<Details row={row} />
			</td>
		);
	} else {
		return null;
	}
};

const Schema = ({row, showPassword}: rowType): JSX.Element => {
	return (
		<td style={{borderBottom: borderLine, padding: '8px'}}>
			<h3>{row.schemaName}</h3>
			<SchemaConnectionString row={row} showPassword={showPassword} />
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

const DatabaseConnectionString = ({row, showPassword}: {row: flattenedType, showPassword: boolean}): JSX.Element => {
	if (row.containerConnection) {
		return (
			<h5>
				CDB:&nbsp;{getConnectionAsString(row.containerConnection, showPassword).toLocaleLowerCase()}
				<br />
				PDB:&nbsp;{getConnectionAsString(row.databaseConnection, showPassword).toLocaleLowerCase()}
			</h5>
		);
	} else {
		return <h5>{getConnectionAsString(row.databaseConnection, showPassword).toLocaleLowerCase()}</h5>;
	}

};

const SchemaConnectionString = ({row, showPassword}: {row: flattenedType, showPassword: boolean}): JSX.Element => {
	const connection = getConnectionAsString(row.schemaConnection, showPassword); 

	return <h5>{connection.toLocaleLowerCase()}</h5>;
};

/*
const Online = ({online}: {online: boolean}): JSX.Element | null => {
	return (
		<div>
			<span className={online ? 'green' : 'red'}>
				{online ? 'online' : 'offline'}
			</span>
		</div>
	);
};
*/

const LastUpdate = ({row}: {row: flattenedType}): JSX.Element | null => {
	const timestamp = row.stats.dynamic && isDate(row.stats.dynamic.timestamp) ? distanceToString(row.stats.dynamic.timestamp) : '';

	return timestamp.length > 0 ? <span className="timestamp">Updated:&nbsp;{timestamp}</span> : null;
};

const Details = ({row}: {row: flattenedType}): JSX.Element | null => {
	const data = [] as {
		title: string,
		value: string,
		unit?: string,
	}[];

	function addLine(title: string, value: string | number | boolean | Date | null, unit = ''): void {
		data.push({
			title,
			value: getValueAsString(value),
			unit,
		});
	}

	if (row.stats.statics) {
		const statics = row.stats.statics;

		addLine('Oracle version', statics.oracle_version);
		addLine('Oracle platform', statics.oracle_platform);
		addLine('Archive logging', statics.oracle_log_mode);
		addLine('Character set', statics.oracle_database_character_set);
		addLine('SGA target', statics.oracle_sga_target);
		addLine('PGA target', statics.oracle_pga_aggregate_target);
	}

	if (row.stats.dynamic) {
		const dynamic = row.stats.dynamic;

		//addLine('Server date', metric.server_date);
		addLine('Host CPU utilization', dynamic.host_cpu_utilization, '%');
		addLine('IO requests per sec', dynamic.io_requests_per_second);
		addLine('Buffer cache hit ratio', dynamic.buffer_cache_hit_ratio, '%');
		addLine('Executions per sec', dynamic.executions_per_sec);
	}

	if (data.length === 0) {
		return null;
	}

	return (
		<div className="metrics-enclosure">
			<div className="metrics">
				{data.map(line => <DetailsLine key={line.title} title={line.title} value={line.value} unit={line.unit} />)}
			</div>
		</div>
	);
};

const DetailsLine = ({title, value, unit = ''}: {title: string, value: string, unit?: string}): JSX.Element => {
	return (
		<>
			<div>
				{title}
			</div>
			<div>
				{value}
				{value.length > 0 && Uint16Array.length > 0 ? unit : ''}
			</div>
		</>
	);
};

const getValueAsString = (value: string | number | boolean | Date | null): string => {
	if (typeof value === 'string') {
		return value;
	} else if (typeof value === 'number') {
		return numberToString(value);
	} else if (typeof value === 'boolean') {
		return value ? 'Yes' : 'No';
	} else if (isDate(value)) {
		return timestampToString(value);
	} else {
		return '';
	}
};
