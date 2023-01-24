import debugModule from 'debug';
import {getConfigPath, sendConfig, getDashboardPath, sendDashboard} from '../server/data/dashboard';
//import {prettyFormat} from '../util/util';

import type express from 'express';
import type {configType} from '../shared/types';

const debug = debugModule('oracle-health-dashboard:handlerData');

export const handlerData = (app: express.Application, config: configType): void => {
	debug('handlerData');

	app.get(`/${getConfigPath()}`, (_req, res) => sendConfig(config, res));
	app.get(`/${getDashboardPath()}`, (_req, res) => sendDashboard(config, res));
};
