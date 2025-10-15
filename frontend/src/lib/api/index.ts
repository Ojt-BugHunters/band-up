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

export const deserialize = async <T>(response: Response): Promise<T> => {
    await throwIfError(response);

    const data: T = await response.json();
    return data;
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

export function putFileToS3WithProgress(opts: {
    url: string;
    file: File;
    onProgress?: (pct: number) => void;
    signal?: AbortSignal;
}): Promise<void> {
    const { url, file, onProgress, signal } = opts;
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable && onProgress) {
                const pct = Math.round((evt.loaded / evt.total) * 100);
                onProgress(pct);
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) return resolve();
            reject(
                new Error(`S3 upload failed: ${xhr.status} ${xhr.statusText}`),
            );
        };

        xhr.onerror = () =>
            reject(new Error('Network error while uploading to S3'));
        xhr.onabort = () => reject(new Error('Upload aborted'));

        xhr.open('PUT', url);
        xhr.setRequestHeader(
            'Content-Type',
            file.type || 'application/octet-stream',
        );

        if (signal) {
            signal.addEventListener('abort', () => {
                try {
                    xhr.abort();
                } catch {}
            });
        }

        xhr.send(file);
    });
}
