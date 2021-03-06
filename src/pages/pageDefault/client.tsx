import React from 'react';
import {hydrate} from 'react-dom';
import {StatusPage} from '../../components/StatusPage/index.js';

import type {flattenedType} from '../../config/flatten.js';

const w = window as {__reactjs_ssr_data?: string};

if (typeof w.__reactjs_ssr_data !== 'string') {
	throw new Error('window has no property "__reactjs_ssr_data" of type "string"');
}

const rows = JSON.parse(w.__reactjs_ssr_data) as flattenedType[];

hydrate(
	<StatusPage rows={rows} />,
	document.querySelector('#root')
);
