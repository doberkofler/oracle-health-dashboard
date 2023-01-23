import debugModule from 'debug';
import {getConfigPath, sendConfig} from '../data/dashboard';
//import {prettyFormat} from '../util/util';

import type express from 'express';
import type {configType} from '../types';

const debug = debugModule('oracle-health-dashboard:handlerData');

export const handlerData = (app: express.Application, config: configType): void => {
	debug('handlerDashboard');

	app.get(`/${getConfigPath()}`, (_req, res) => sendConfig(config, res));
};
