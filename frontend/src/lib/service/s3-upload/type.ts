import z from 'zod';

export type MediaResponse = {
    key: string;
    uploadUrl?: string;
    cloudFrontUrl: string;
    expiresAt: string;
};

export interface SaveFileVars {
    key: string;
}
export interface MediaRequest {
    entityType?: string;
    entityId?: string;
    fileName: string;
    contentType: string;
}

export type S3UploadProgress = {
    loaded: number;
    total?: number;
    pct?: number;
};

export type S3UploadResult = {
    status: number;
    etag?: string | null;
    location?: string | null;
};

export type PutToS3Options = {
    url: string;
    file: Blob | File;
    contentType?: string;
    onProgress?: (p: S3UploadProgress) => void;
    signal?: AbortSignal;
    expectedStatuses: number[];
};

export const fileSchema = z.object({
    files: z
        .array(z.custom<File>())
        .max(1, 'Can be upload one file')
        .refine(
            (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
            {
                message: 'File size must be less than 5MB',
                path: ['files'],
            },
        )
        .optional(),
});
