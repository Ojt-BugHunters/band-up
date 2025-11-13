'use client';

import { fetchWrapper, throwIfError } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    MediaRequest,
    PutToS3Options,
    S3UploadResult,
    SaveFileVars,
} from './type';

export function useSaveFile() {
    const mutation = useMutation({
        mutationFn: async ({ key }: SaveFileVars) => {
            const url = `/profile/avatar/save?key=${encodeURIComponent(key)}`;
            const response = await fetchWrapper(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            await throwIfError(response);
            return response.json();
        },
        onSuccess: () => {
            toast.success('File key save successfully');
        },
        onError: () => {
            toast.error('Fail to save file key');
        },
    });
    return mutation;
}

export function usePresignUpload(endpoint: string = 'media/presign') {
    const mutation = useMutation({
        mutationFn: async (body: MediaRequest) => {
            const response = await fetchWrapper(endpoint, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            await throwIfError(response);
            return response.json();
        },
        onSuccess: (data) => {
            localStorage.setItem('uploadedKeys', data.key);
            toast.success('Presign URL created successfully');
        },
        onError: (error) => {
            toast.error(error?.message || 'Failed to presign avatar');
        },
    });

    return mutation;
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
