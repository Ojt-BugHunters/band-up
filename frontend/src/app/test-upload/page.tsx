'use client';

import { Upload, X } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
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
import { usePresignUpload } from '@/hooks/use-get-presign-upload';
import { putFileToS3WithProgress } from '@/lib/api/index';

export default function FileUploadDirectUploadDemo() {
    const [files, setFiles] = React.useState<File[]>([]);
    const [progressMap, setProgressMap] = React.useState<
        Record<string, number>
    >({});

    return (
        <FileUpload
            value={files}
            // onValueChange={handleValueChange}
            accept="image/*,audio/*,video/*"
            maxFiles={2}
            className="w-full max-w-md"
            multiple
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
                        Or click to browse (max 2 files)
                    </p>
                </div>
                <FileUploadTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-2 w-fit">
                        Browse files
                    </Button>
                </FileUploadTrigger>
            </FileUploadDropzone>

            <FileUploadList>
                {files.map((file, index) => {
                    const id = `${file.name}-${file.size}-${file.lastModified}`;
                    const pct = progressMap[id] ?? 0;
                    return (
                        <FileUploadItem
                            key={index}
                            value={file}
                            className="flex-col"
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
                                    >
                                        <X />
                                    </Button>
                                </FileUploadItemDelete>
                            </div>
                            {/* FileUploadItemProgress dùng context của lib; ở flow này ta hiển thị % đơn giản ở trên */}
                            {/* <FileUploadItemProgress /> */}
                            <div className="bg-muted h-1 w-full rounded">
                                <div
                                    className="bg-primary h-1 rounded"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </FileUploadItem>
                    );
                })}
            </FileUploadList>
        </FileUpload>
    );
}
