//import debugModule from 'debug';
import {numberToString, timestampToString, isDate, distanceToString} from '../../util/util.js';
import {connectionToString} from '../../config/connection.js';
import React from 'react';

import type {flattenedType} from '../../config/flatten.js';

type rowType = {
	row: flattenedType,
};

type detailType = {
	title: string,
	value: string,
	unit?: string,
};

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

const Row = ({row}: rowType): JSX.Element => {
	return (
		<tr>
			<Host row={row} />
			<Database row={row} />
			<Schema row={row} />
		</tr>
	);
};

const Host = ({row}: rowType): JSX.Element | null => {
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

const Database = ({row}: rowType): JSX.Element | null => {
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

const Schema = ({row}: rowType): JSX.Element => {
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

const DatabaseConnectionString = ({row}: rowType): JSX.Element => {
	if (row.containerConnection) {
		return (
			<h5>
				CDB:&nbsp;{connectionToString(row.containerConnection).toLocaleLowerCase()}
				<br />
				PDB:&nbsp;{connectionToString(row.databaseConnection).toLocaleLowerCase()}
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
	if (timestamp && isDate(timestamp)) {
		return <span className="timestamp">Updated&nbsp;{distanceToString(timestamp)}</span>;
	} else {
		return null;
	}
};

const DatabaseDetails = ({row}: rowType): JSX.Element | null => {
	const data: detailType[] = [];

	if (row.stats.statics) {
		const statics = row.stats.statics;

		addLine(data, 'Oracle version', statics.oracle_version);
		addLine(data, 'Oracle platform', statics.oracle_platform);
		addLine(data, 'Archive logging', statics.oracle_log_mode);
		addLine(data, 'Character set', statics.oracle_database_character_set);
		addLine(data, 'SGA target', statics.oracle_sga_target);
		addLine(data, 'PGA target', statics.oracle_pga_aggregate_target);

		if (row.stats.dynamic) {
			const dynamic = row.stats.dynamic;

			//addLine('Server date', metric.server_date);
			addLine(data, 'Host CPU utilization', dynamic.host_cpu_utilization, '%');
			addLine(data, 'IO requests per sec', dynamic.io_requests_per_second);
			addLine(data, 'Buffer cache hit ratio', dynamic.buffer_cache_hit_ratio, '%');
			addLine(data, 'Executions per sec', dynamic.executions_per_sec);

			if (statics.oracle_log_mode === 'ARCHIVELOG') {
				addLine(data, 'Last successful RMAN backup: data files', dynamic.last_successful_rman_backup_date_full_db);
				addLine(data, 'Last successful RMAN backup: archive logs', dynamic.last_successful_rman_backup_date_archive_log);
				addLine(data, 'Last attempted RMAN backup: data files', dynamic.last_rman_backup_date_full_db);
				addLine(data, 'Last attempted RMAN backup: archive logs', dynamic.last_rman_backup_date_archive_log);
			}

			// custom metrics
			dynamic.custom.forEach(e => {
				addLine(data, e.title, e.value);
			});
		}
	}

	return <Details data={data} />;
};

const addLine = (data: detailType[], title: string, value: string | number | boolean | Date | null, unit = ''): void => {
	data.push({
		title,
		value: getValueAsString(value),
		unit,
	});
};

const Details = ({data}: {data: detailType[]}): JSX.Element | null => {
	if (data.length > 0) {
		return (
			<div className="metrics-enclosure">
				<div className="metrics">
					{data.map(line => <DetailsLine key={line.title} title={line.title} value={line.value} unit={line.unit} />)}
				</div>
			</div>
		);
	} else {
		return null;
	}
};

const DetailsLine = ({title, value, unit = ''}: {title: string, value: string, unit?: string}): JSX.Element => {
	return (
		<>
			<div>
				{title}
			</div>
			<div>
				{value}
				{value.length > 0 && unit.length > 0 ? unit : ''}
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
