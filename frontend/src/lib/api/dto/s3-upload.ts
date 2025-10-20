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
