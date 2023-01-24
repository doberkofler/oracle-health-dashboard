import {sendJson} from '../../shared/util/data';
import {z$configType, z$dashboardType} from '../../shared/types';
import {statsLoad} from '../../server/statsStore';
export {getConfigPath, getDashboardPath} from '../../client/data/dashboard';

import type {configType, dashboardType} from '../../shared/types';
import type {Response} from 'express';

// config
export const sendConfig = (config: configType, res: Response): Response => sendJson(z$configType, config, res);

// dashboard
export const sendDashboard = (config: configType, res: Response): Response => {
	const stats = statsLoad();
	const dashboard: dashboardType = {
		config,
		stats,
	};

	return sendJson(z$dashboardType, dashboard, res);
};
