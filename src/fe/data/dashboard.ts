import {useQuery} from '@tanstack/react-query';
import {getJson} from '../../shared/util/data';
import {z$configType, z$dashboardType} from '../../shared/types';

import type {configType, dashboardType} from '../../shared/types';
import type {UseQueryResult} from '@tanstack/react-query';

// config
export const getConfigPath = (): string => 'data_config';
const getConfig = async (): Promise<configType> => getJson(getConfigPath(), z$configType);
export const useConfig = (): UseQueryResult<configType, Error> => useQuery<configType, Error>(['config'], async () => getConfig());

// dashboard
export const getDashboardPath = (): string => 'data_dashboard';
const getDashboard = async (): Promise<dashboardType> => getJson(getDashboardPath(), z$dashboardType);
export const useDashboard = (): UseQueryResult<dashboardType, Error> => useQuery<dashboardType, Error>(['dashboard'], async () => getDashboard());
