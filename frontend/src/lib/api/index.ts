import { getApiUrl } from './api-url';
import { PutToS3Options, S3UploadResult } from './dto/s3-upload';

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

export function putFileToS3WithProgress({
    url,
    file,
    contentType,
    onProgress,
    signal,
    expectedStatuses = [200, 201, 204],
}: PutToS3Options): Promise<S3UploadResult> {
    return new Promise<S3UploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (evt: ProgressEvent) => {
            if (!onProgress) return;
            const loaded = evt.loaded ?? 0;
            const total = evt.lengthComputable ? evt.total : undefined;
            const pct = total ? Math.round((loaded / total) * 100) : undefined;
            onProgress({ loaded, total, pct });
        };

        xhr.onload = () => {
            if (expectedStatuses.includes(xhr.status)) {
                const etag = xhr.getResponseHeader('ETag');
                const location = xhr.getResponseHeader('Location');
                resolve({ status: xhr.status, etag, location });
            } else {
                reject(
                    new Error(
                        `S3 upload failed: ${xhr.status} ${xhr.statusText}`,
                    ),
                );
            }
        };

        xhr.onerror = () =>
            reject(new Error('Network error while uploading to S3'));
        xhr.onabort = () => reject(new Error('Upload aborted'));

        try {
            xhr.open('PUT', url);
            const ct =
                contentType ??
                (file as File).type ??
                'application/octet-stream';
            xhr.setRequestHeader('Content-Type', ct);
            xhr.send(file);
        } catch (e) {
            reject(
                e instanceof Error
                    ? e
                    : new Error('Failed to start XHR upload'),
            );
            return;
        }

        if (signal) {
            if (signal.aborted) {
                try {
                    xhr.abort();
                } catch {}
            } else {
                signal.addEventListener('abort', () => {
                    try {
                        xhr.abort();
                    } catch {}
                });
            }
        }
    });
}
