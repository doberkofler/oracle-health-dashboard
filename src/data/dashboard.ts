import {useQuery} from '@tanstack/react-query';
import {getJson, sendJson} from './data';
import {z$configType} from '../types';

import type {configType} from '../types';
import type {UseQueryResult} from '@tanstack/react-query';
import type {Response} from 'express';

// config
export const getConfigPath = (): string => 'data_config';
const getConfig = async (): Promise<configType> => getJson(getConfigPath(), z$configType);
export const useConfig = (): UseQueryResult<configType, Error> => useQuery<configType, Error>(['config'], async () => getConfig());
export const sendConfig = (config: configType, res: Response): Response => sendJson(z$configType, config, res);
