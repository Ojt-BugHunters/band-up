import { getApiUrl } from './api-url';

export class ApiError extends Error {
    details: Record<string, string>;
    constructor(message: string, details: Record<string, string>) {
        super(message);
        this.details = details;
    }
}

export const throwIfError = async (response: Response) => {
    if (!response.ok) {
        const error: ApiError = await response.json();
        throw error;
    }
};

// deserialize mean when backend give us a bunch of data in response
// we need the middleware to receive that data that will filter just get what we need
export const deserialize = async <T>(response: Response): Promise<T> => {
    await throwIfError(response);

    const data: T = await response.json();
    return data;
};

// fetch wrapper to fetch api
export const fetchWrapper = async (
    url: RequestInfo | URL,
    init?: RequestInit,
) => {
    const base = await getApiUrl();
    const apiUrl = `${base}${url}`;

    return await fetch(apiUrl, {
        ...init,
        credentials: 'include',
    });
};
// When backend return a pageable object it have a lot of unneed information
// We just need the data and element_count (for the pagination purpose)
// This interface will convert the pageable object to a new object with data we need
export interface Pagination<T> {
    totalElements: number;
    content: T[];
}

// When we do pagination, (see in swagger) we need to send many info to backend
// ex: pageNo:0, pageSize:8, sortBy:'id',... all of this information is a pair of [key, value]
// This function will get all of the pairs --> doing for loop and build the param to fetch to backend

export const buildParams = (data: Record<string, unknown>) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null) {
            params.append(key, String(value));
        }
    }
    return params;
};
