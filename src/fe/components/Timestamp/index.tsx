import {isDate, distanceToString, timestampToString} from '../../../shared/util/util';
import React from 'react';

export const Timestamp = ({timestamp}: {readonly timestamp: Date | null}): JSX.Element | null => {
	if (timestamp && isDate(timestamp)) {
		return <span title={timestampToString(timestamp)} style={{textDecorationStyle: 'dotted'}}>{distanceToString(timestamp)}</span>;
	} else {
		return null;
	}
};
