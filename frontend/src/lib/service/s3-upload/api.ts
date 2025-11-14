'use client';

import { fetchWrapper, throwIfError } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    ErrorMap,
    fileIdOf,
    MediaRequest,
    MediaResponse,
    Options,
    ProgressMap,
    PutToS3Options,
    S3UploadResult,
    SaveFileVars,
} from './type';
import { useCallback, useRef, useState } from 'react';

// save key to db
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

// get key for uploading to s3
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

// upload to s3 with progress for tracking
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

// combine media presign + upload to s3 + send key to backend to save in just one hook
export function useS3Upload({
    entityType,
    entityId,
    presignEndpoint = 'media/presign',
}: Options = {}) {
    const [progressMap, setProgressMap] = useState<ProgressMap>({});
    const [errors, setErrors] = useState<ErrorMap>({});
    const [isUploading, setIsUploading] = useState(false);
    const controllersRef = useRef<Record<string, AbortController>>({});

    const presignMutation = usePresignUpload(presignEndpoint);

    const cancel = useCallback((fileId: string) => {
        const ctl = controllersRef.current[fileId];
        if (ctl) ctl.abort();
        delete controllersRef.current[fileId];
        setProgressMap((m) => ({ ...m, [fileId]: 0 }));
    }, []);

    const cancelAll = useCallback(() => {
        Object.values(controllersRef.current).forEach((ctl) => ctl.abort());
        controllersRef.current = {};
    }, []);

    const resetState = useCallback(() => {
        controllersRef.current = {};
        setProgressMap({});
        setErrors({});
        setIsUploading(false);
    }, []);

    const uploadFiles = useCallback(
        async (files: File[]) => {
            if (!files?.length) return;

            setIsUploading(true);

            files.forEach((file) => {
                const id = fileIdOf(file);
                setProgressMap((m) => ({ ...m, [id]: 0 }));
                setErrors((e) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [id]: _omit, ...rest } = e;
                    return rest;
                });
            });

            await Promise.allSettled(
                files.map(async (file) => {
                    const id = fileIdOf(file);

                    try {
                        const body: MediaRequest = {
                            entityType,
                            entityId,
                            fileName: file.name,
                            contentType:
                                file.type || 'application/octet-stream',
                        };
                        const media: MediaResponse =
                            await presignMutation.mutateAsync(body);
                        if (!media.uploadUrl)
                            throw new Error('Missing uploadUrl');

                        const ctl = new AbortController();
                        controllersRef.current[id] = ctl;

                        await putFileToS3WithProgress({
                            url: media.uploadUrl,
                            file,
                            contentType: body.contentType,
                            expectedStatuses: [200, 201, 204],
                            signal: ctl.signal,
                            onProgress: ({ pct }) => {
                                setProgressMap((m) => ({
                                    ...m,
                                    [id]: Math.max(0, Math.min(100, pct ?? 0)),
                                }));
                            },
                        });

                        setProgressMap((m) => ({ ...m, [id]: 100 }));
                        delete controllersRef.current[id];
                    } catch (err) {
                        const message =
                            err instanceof Error
                                ? err.message
                                : 'Upload failed';
                        setErrors((e) => ({ ...e, [id]: message }));
                        delete controllersRef.current[id];
                    }
                }),
            );

            setIsUploading(false);
        },
        [entityType, entityId, presignMutation],
    );

    return {
        uploadFiles,
        cancel,
        cancelAll,
        resetState,
        isUploading,
        progressMap,
        errors,
    };
}
