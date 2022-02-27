import {isDate, distanceToString, timestampToString} from '../../util/util.js';
import React from 'react';

export const Timestamp = ({timestamp}: {timestamp: Date | null}): JSX.Element | null => {
	if (timestamp && isDate(timestamp)) {
		return <span title={timestampToString(timestamp)} style={{textDecorationStyle: 'dotted'}}>{distanceToString(timestamp)}</span>;
	} else {
		return null;
	}
};
