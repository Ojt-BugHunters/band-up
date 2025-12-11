import { getApiUrl } from './api-url';
import { getWebSocketUrl } from './api-url';

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

export const deserialize = async <T>(response: Response): Promise<T> => {
    await throwIfError(response);

    const data: T = await response.json();
    return data;
};

export const getWsApi = async () => {
    return getWebSocketUrl();
};

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
export interface Pagination<T> {
    totalElements: number;
    content: T[];
}

export const buildParams = (data: Record<string, unknown>) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null) {
            params.append(key, String(value));
        }
    }
    return params;
};

export async function parseBoolean(res: Response): Promise<boolean> {
    try {
        const data = await res.clone().json();
        if (typeof data === 'boolean') return data;
        if (typeof data === 'string') return data.toLowerCase() === 'true';
    } catch {}
    try {
        const txt = (await res.text()).trim().toLowerCase();
        return txt === 'true';
    } catch {
        return false;
    }
}
