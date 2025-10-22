'use client';

import { useCallback, useRef, useState } from 'react';
import { putFileToS3WithProgress } from '@/lib/api';
import { usePresignUpload } from './use-get-presign-upload';
import type { MediaRequest, MediaResponse } from '@/lib/api/dto/media';
import { useSaveFile } from './use-save-file';

type Options = {
    entityType?: string;
    entityId?: string;
    presignEndpoint?: string;
};

export function fileIdOf(file: File) {
    return `${file.name}-${file.size}-${file.lastModified}`;
}

type ProgressMap = Record<string, number>;
type ErrorMap = Record<string, string>;

export function useS3Upload({
    entityType,
    entityId,
    presignEndpoint = 'media/presign',
}: Options = {}) {
    const [progressMap, setProgressMap] = useState<ProgressMap>({});
    const [errors, setErrors] = useState<ErrorMap>({});
    const [isUploading, setIsUploading] = useState(false);
    const saveFileMutation = useSaveFile();
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

                        await saveFileMutation.mutateAsync({
                            apiUrl: '/profile/avatar/save',
                            key: media.key,
                        });
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
