import { useState, useCallback } from 'react';
import { usePresignUpload } from './use-get-presign-upload';

type Options = {
    entityType: string;
    entityId: string;
    presignEndpoint?: string;
};

export function fileIdOf(file: File) {
    return `${file.name}-${file.size}-${file.lastModified}`;
}

export function useS3Upload({
    entityType,
    entityId,
    presignEndpoint,
}: Options) {
    const [progressMap, setProgressMap] = useState<Record<string, number>>({});
    const [controllers] = useState<Record<string, AbortController>>({});
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const presignMutation = usePresignUpload(presignEndpoint);

    const cancel = useCallback(
        (fileId: string) => {
            const ctl = controllers[fileId];
            if (ctl) ctl.abort();
        },
        [controllers],
    );

    const uploadFiles = useCallback(async (files: File[]) => {
        if (!files.length) return;
        setIsUploading(true);
        try {
            await Promise.all(
                files.map(async (file) => {
                    const fileId = fileIdOf(file);
                    setProgressMap((m) => ({...m, [fileId]: 0})) // reset state
                    setErrors((e) => { const { [fileId]: _, ...rest} = e; return rest;})
                })

            )
        }
    });
}
