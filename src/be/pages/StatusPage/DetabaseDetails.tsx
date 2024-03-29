//import debugModule from 'debug';
import {numberToString, isDate} from '../../../shared/util/util';
import React from 'react';
import {Timestamp} from '../../../fe/components/Timestamp';

import type {flattenedType} from '../../flatten';

type detailType = {
	title: string,
	value: string | number | boolean | Date | null,
	unit?: string,
};

type rowPropsType = {readonly row: flattenedType};

export const DatabaseDetails = ({row}: rowPropsType): JSX.Element | null => {
	const data: detailType[] = [];

	if (row.stats.statics !== null) {
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

export const addLine = (data: detailType[], title: string, value: string | number | boolean | Date | null, unit = ''): void => {
	data.push({
		title,
		value,
		unit,
	});
};

export const Details = ({data}: {readonly data: detailType[]}): JSX.Element | null => {
	if (data.length > 0) {
		return (
			<div className="metrics-enclosure">
				<div className="metrics">
					{data.map(line => <DetailsLine key={line.title} title={line.title} value={line.value} unit={typeof line.unit === 'string' ? line.unit : ''} />)}
				</div>
			</div>
		);
	} else {
		return null;
	}
};

const DetailsLine = ({title, value, unit = ''}: {readonly title: string, readonly value: string | number | boolean | Date | null, readonly unit: string}): JSX.Element => {
	return (
		<>
			<div>
				{title}
			</div>
			<div>
				<DetailsValue value={value} unit={unit} />
			</div>
		</>
	);
};

const DetailsValue = ({value, unit = ''}: {readonly value: string | number | boolean | Date | null, readonly unit: string}): JSX.Element | null => {
	if (typeof value === 'string') {
		return <span>{value}{value.length > 0 && unit.length > 0 ? unit : ''}</span>;
	} else if (typeof value === 'number') {
		return <span>{numberToString(value)}{unit.length > 0 ? unit : ''}</span>;
	} else if (typeof value === 'boolean') {
		return <span>{value ? 'Yes' : 'No'}</span>;
	} else if (isDate(value)) {
		return <Timestamp timestamp={value} />;
	} else {
		return null;
	}
};
