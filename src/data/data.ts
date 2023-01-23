import axios from 'axios';
import qs from 'qs';
import {useQuery} from '@tanstack/react-query';
import {join} from '../util/url';
import {stringify, parse} from '../util/stringify';
import {z} from 'zod';

import type express from 'express';
import type {UseQueryResult} from '@tanstack/react-query';

//type JSONValueType = null | string | number | boolean | Date | {[key: string]: JSONValueType} | JSONValueType[];

export enum StatusType {
	SUCCESS = 'SUCCESS',
	INFO = 'INFO',
	WARNING = 'WARNING',
	VALIDATE = 'VALIDATE',
	NOSESSION = 'NOSESSION',
	EXCEPTION = 'EXCEPTION',
}

const z$stat = z.object({
	status: z.nativeEnum(StatusType),
	message: z.optional(z.string()),
	error: z.optional(z.string()),
	logid: z.optional(z.number()),
	stack: z.optional(z.array(z.string())),
}).strict();
const z$response = z.object({
	stat: z$stat,
	data: z.optional(z.custom()),
}).strict();
const z$responseRows = z.object({
	stat: z$stat,
	data: z.object({
		rows: z.optional(z.custom()),
	}).strict(),
}).strict();

export type rowType = (string | number | boolean)[];
export type tableType = {
	cols: string[],
	rows: rowType[],
};

const state = {
	backendBaseUrl: '',
};

const z$updateFile = z.object({
	filename: z.string(),
	mimeType: z.string(),
	fileSize: z.number(),
}).strict();
type updateFileType = z.infer<typeof z$updateFile>;

/**
*	set the url base for the backend
*/
export const setBackendBaseUrl = (url: string): void => {
	// just to validate
	new URL(url);

	state.backendBaseUrl = url;
};

/**
*	get the url base for the backend
*/
export const getBackendBaseUrl = (api = ''): string => {
	if (state.backendBaseUrl === '') {
		if (typeof window?.location?.href === 'string' && window?.location?.href.length > 0) {
			const url = new URL(window?.location?.href);

			state.backendBaseUrl = `${url.protocol}//${url.host}`;
		} else {
			throw new Error('Unable to determine the backend base url! No base url has been set and window.location.href is not available');
		}
	}

	return join(state.backendBaseUrl, api);
};

/*
*	get error message
*/
const getErrorMessage = (error: string, exception: Error | null, resource: string, para: string): string => {
	let errorMessage = `${error}.`;

	if (exception instanceof Error) {
		errorMessage += ` exception="${exception.message}".`;
	}

	errorMessage += ` resource="${resource}".`;

	if (typeof para !== 'undefined') {
		errorMessage += ` para="${para}".`;
	}

	return errorMessage;
};

/*
*	Axios transformer for JSON
*/
const transformJsonResponse = (value: unknown): unknown => {
	if (typeof value !== 'string') {
		throw new Error('Error in axios transformer because the value is not of type string');
	}

	return value === '' ? {} : parse(value);
};

/**
 *	Send json data from the backend
 *
 *  @param [res] - The response.
 *  @param [data] - The data to be send.
 *	@returns The response.
*/
export const sendJson = <
	T extends z.ZodTypeAny
> (
	dataSchema: T,
	data: z.infer<T>,
	res: express.Response,
): express.Response => {

	dataSchema.parse(data);

	res.contentType('application/json');
	res.status(200);
	
	return res.send({
		stat: {
			status: StatusType.SUCCESS,
		},
		data,
	});
};


/**
 *	Get json data from the backend
 *
 *  @param url - The server URL that will be used for the request.
 *  @param [querySchema] - The zod schema of the parameter to be submitted.
 *  @param [query] - The parameter to be submitted.
 *  @param responseSchema - The zod schema of the data to be returned.
 *	@returns The data.
*/
export const getJson = async <
	TQuerySchema extends z.ZodTypeAny,
	TResponseSchema extends z.ZodTypeAny
> (
	url: string,
	responseSchema: TResponseSchema,
	querySchema?: TQuerySchema,
	query?: z.infer<TQuerySchema>,
): Promise<z.infer<TResponseSchema>> => {
	// validate the query schema
	if (querySchema) {
		querySchema.parse(query);
	}

	// get
	const response = await axios({
		method: 'GET',
		url: getBackendBaseUrl(url),
		params: query,
		responseType: 'json',
		transformResponse: transformJsonResponse,
	});

	// http status
	if (response.status !== 200) {
		console.error(response);
		throw new Error(getErrorMessage(`Backend api returned status "${response.status}"`, null, url, response.statusText));
	}

	// validate the status
	const json = z$response.parse(response.data);
	if (json.stat.status !== StatusType.SUCCESS) {
		throw new Error(getErrorMessage(`Backend api returned status "${json.stat.status}"`, null, url, qs.stringify(query)));
	}

	// parse the data and return it
	return responseSchema.parse(json.data); // eslint-disable-line @typescript-eslint/no-unsafe-return
};

/**
 *	Get json rows from the backend
 *  @param url - The server URL that will be used for the request.
 *  @param responseSchema - The zod schema of the data to be returned.
 *  @param [querySchema] - The zod schema of the parameter to be submitted.
 *  @param [query] - The parameter to be submitted.
 *	@returns The data.
*/
export const getJsonRows = async <
	TQuerySchema extends z.ZodTypeAny,
	TResponseSchema extends z.ZodTypeAny
> (
	url: string,
	responseSchema: TResponseSchema,
	querySchema?: TQuerySchema,
	query?: z.infer<TQuerySchema>,
): Promise<z.infer<TResponseSchema>> => {
	// validate the parameter
	if (querySchema) {
		querySchema.parse(query);
	}

	// get
	const response = await axios({
		method: 'GET',
		url: getBackendBaseUrl(url),
		params: query,
		responseType: 'json',
		transformResponse: transformJsonResponse,
	});

	// http status
	if (response.status !== 200) {
		console.error(response);
		throw new Error(getErrorMessage(`Backend api returned status "${response.status}"`, null, url, response.statusText));
	}

	// validate the status
	const json = z$responseRows.parse(response.data);
	if (json.stat.status !== StatusType.SUCCESS) {
		throw new Error(getErrorMessage(`Backend api returned status "${json.stat.status}"`, null, url, qs.stringify(query)));
	}

	// parse the data and return it
	return responseSchema.parse(json?.data?.rows); // eslint-disable-line @typescript-eslint/no-unsafe-return
};

/**
 *	get text from the backend
 *  @param url - The server URL that will be used for the request.
 *  @param [querySchema] - The zod schema of the parameter to be submitted.
 *  @param [query] - The parameter to be submitted.
 *	@returns The text.
*/
export const getText = async <TQuerySchema extends z.ZodTypeAny>(
	url: string,
	querySchema?: TQuerySchema,
	query?: z.infer<TQuerySchema>,
): Promise<string> => {
	// validate the parameter
	if (querySchema) {
		querySchema.parse(query);
	}

	// get
	const response = await axios({
		method: 'GET',
		url: getBackendBaseUrl(url),
		params: query,
		responseType: 'text',
	});

	// http status
	if (response.status !== 200) {
		console.error(response);
		throw new Error(getErrorMessage(`Backend api returned status "${response.status}"`, null, url, response.statusText));
	}

	// parse the data and return it
	return z.string().parse(response.data);
};

export const useText = (url: string): UseQueryResult<string, Error> => useQuery<string, Error>(['getText', url], async () => getText(url));

/**
 *	post data to the backend and retrieve json status object
 *  @param url - The server URL that will be used for the request.
 *  @param responseSchema - The zod schema of the data to be returned.
 *  @param querySchema - The zod schema of the parameter to be submitted.
 *  @param query - The parameter to be submitted.
 *	@returns The data.
*/
export const post = async <
	TQuerySchema extends z.ZodTypeAny,
	TResponseSchema extends z.ZodTypeAny
> (
	url: string,
	responseSchema: TResponseSchema,
	querySchema: TQuerySchema,
	query: z.infer<TQuerySchema>,
): Promise<z.infer<TResponseSchema>> => {
	// validate the parameter
	querySchema.parse(query);

	// post
	const response = await axios({
		method: 'POST',
		url: getBackendBaseUrl(url),
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
		},
		data: qs.stringify(query),
		responseType: 'json',
		transformResponse: transformJsonResponse,
	});

	// http status
	if (response.status !== 200) {
		console.error(response);
		throw new Error(getErrorMessage(`Backend api returned status "${response.status}"`, null, url, response.statusText));
	}

	// validate the status
	const json = z$response.parse(response.data);
	if (json.stat.status !== StatusType.SUCCESS) {
		throw new Error(getErrorMessage(`Backend api returned status "${json.stat.status}"`, null, url, qs.stringify(query)));
	}

	// parse the data and return it
	return responseSchema.parse('data' in json ? json.data : {}); // eslint-disable-line @typescript-eslint/no-unsafe-return
};

/**
 *	post data as jsoin string to the backend and retrieve json status object
 *  @param url - The server URL that will be used for the request.
 *  @param responseSchema - The zod schema of the data to be returned.
 *  @param querySchema - The zod schema of the parameter to be submitted.
 *  @param query - The parameter to be submitted.
 *	@returns The data.
*/
export const postJson = async <
	TQuerySchema extends z.ZodTypeAny,
	TResponseSchema extends z.ZodTypeAny
> (
	url: string,
	responseSchema: TResponseSchema,
	querySchema: TQuerySchema,
	query: z.infer<TQuerySchema>,
): Promise<z.infer<TResponseSchema>> => {
	// validate the parameter
	querySchema.parse(query);

	// post
	return post(url, responseSchema, z.object({para: z.string()}), {para: stringify(query)});
};

/**
 *	post data to the backend and retrieve json status object
 *  @param file - The filename to upload.
 *	@returns A promise that will resolved when done.
*/
export const uploadFile = async (file: File): Promise<updateFileType> => {
	const url = 'FileUpload.file';

	// emulate form
	const formData = new FormData();
	formData.append('file', file);

	// post
	const response = await axios({
		method: 'POST',
		url: getBackendBaseUrl(url),
		headers: {
			'content-type': 'multipart/form-data',
		},
		data: formData,
		responseType: 'json',
		transformResponse: transformJsonResponse,
	});

	// http status
	if (response.status !== 200) {
		console.error(response);
		throw new Error(getErrorMessage(`Backend api returned status "${response.status}"`, null, url, response.statusText));
	}

	// validate the status
	const json = z$response.parse(response.data);
	if (json.stat.status !== StatusType.SUCCESS) {
		throw new Error(getErrorMessage(`Backend api returned status "${json.stat.status}"`, null, url, file.name));
	}

	// parse the data and return it
	return z$updateFile.parse('data' in json ? json.data : {});
};
