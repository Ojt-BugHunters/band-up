'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    FileUpload,
    FileUploadDropzone,
    FileUploadItem,
    FileUploadItemDelete,
    FileUploadItemMetadata,
    FileUploadItemPreview,
    FileUploadList,
    FileUploadTrigger,
} from '@/components/ui/file-upload';
import { useS3Upload, fileIdOf } from '@/hooks/use-s3-upload';

export type S3FileUploadedProps = {
    presignEndpoint: string;
    accept?: string;
    entityType?: string;
    entityId?: string;
    maxFiles?: number;
    multiple?: boolean;
    className?: string;
    onFilesChange?: (files: File[]) => void;
    onUploadComplete?: (files: File[]) => Promise<void>;
    onUploaded?: () => Promise<void>;
};

export default function S3FileUploader({
    presignEndpoint,
    accept = 'image/* , audio/* ,video/*',
    maxFiles = 2,
    multiple = true,
    className,
    onFilesChange,
    entityType,
    entityId,
    onUploaded,
}: S3FileUploadedProps) {
    const [files, setFiles] = useState<File[]>([]);

    const { uploadFiles, cancel, cancelAll, isUploading, progressMap, errors } =
        useS3Upload({ presignEndpoint, entityId, entityType });

    const handleValueChange = (next: File[]) => {
        setFiles(next);
        onFilesChange?.(next);
    };

    const handleStartUpload = async () => {
        if (!files.length) return;
        await uploadFiles(files);
        await onUploaded?.();
    };

    return (
        <div
            className={['flex w-full max-w-md flex-col gap-3', className]
                .filter(Boolean)
                .join(' ')}
        >
            <FileUpload
                value={files}
                onValueChange={handleValueChange}
                accept={accept}
                maxFiles={maxFiles}
                className="w-full"
                multiple={multiple}
            >
                <FileUploadDropzone>
                    <div className="flex flex-col items-center gap-1 text-center">
                        <div className="flex items-center justify-center rounded-full border p-2.5">
                            <Upload className="text-muted-foreground size-6" />
                        </div>
                        <p className="text-sm font-medium">
                            Drag & drop files here
                        </p>
                        <p className="text-muted-foreground text-xs">
                            Or click to browse (max {maxFiles} files)
                        </p>
                    </div>
                    <FileUploadTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-fit"
                        >
                            Browse files
                        </Button>
                    </FileUploadTrigger>
                </FileUploadDropzone>
                <FileUploadList>
                    {files.map((file, index) => {
                        const id = fileIdOf(file);
                        const pct = progressMap[id] ?? 0;
                        const err = errors[id];

                        return (
                            <FileUploadItem
                                key={index}
                                value={file}
                                className="flex-col gap-2 rounded-lg border p-2"
                            >
                                <div className="flex w-full items-center gap-2">
                                    <FileUploadItemPreview />
                                    <FileUploadItemMetadata />
                                    <div className="ml-auto text-xs tabular-nums">
                                        {pct}%
                                    </div>
                                    <FileUploadItemDelete asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7"
                                            disabled={
                                                isUploading &&
                                                pct > 0 &&
                                                pct < 100
                                            }
                                        >
                                            <X />
                                        </Button>
                                    </FileUploadItemDelete>
                                </div>

                                <div className="bg-muted h-1 w-full rounded">
                                    <div
                                        className="bg-primary h-1 rounded"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>

                                <div className="flex w-full items-center justify-between">
                                    {err ? (
                                        <span className="text-destructive text-xs">
                                            {err}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">
                                            {pct === 100
                                                ? 'Done'
                                                : isUploading
                                                  ? 'Uploading…'
                                                  : 'Ready'}
                                        </span>
                                    )}

                                    {pct > 0 && pct < 100 ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-xs"
                                            onClick={() => cancel(id)}
                                        >
                                            Cancel
                                        </Button>
                                    ) : null}
                                </div>
                            </FileUploadItem>
                        );
                    })}
                </FileUploadList>
            </FileUpload>
            <div className="flex items-center gap-2">
                <Button
                    onClick={handleStartUpload}
                    disabled={!files.length || isUploading}
                >
                    {isUploading ? 'Uploading…' : 'Start upload'}
                </Button>
                <Button
                    variant="outline"
                    onClick={cancelAll}
                    disabled={!isUploading}
                >
                    Cancel all
                </Button>
            </div>
        </div>
    );
}
