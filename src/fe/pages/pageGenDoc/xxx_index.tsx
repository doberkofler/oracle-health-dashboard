import React from 'react';
import {hydrateRoot} from 'react-dom/client';
import {StatusPage} from '../../../be/pages/StatusPage/index';

import type {flattenedType} from '../../../be/flatten';

const w = window as {__reactjs_ssr_data?: string};

if (typeof w.__reactjs_ssr_data !== 'string') {
	throw new Error('window has no property "__reactjs_ssr_data" of type "string"');
}

const rows = JSON.parse(w.__reactjs_ssr_data) as flattenedType[];

const domNode = document.querySelector('#root');
if (domNode) {
	hydrateRoot(domNode, <StatusPage rows={rows} />);
}
