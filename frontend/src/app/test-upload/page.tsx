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
    FileUploadItemProgress, // (sẽ không nhúc nhích nếu không dùng onUpload callbacks)
    FileUploadList,
    type FileUploadProps,
    FileUploadTrigger,
} from '@/components/ui/file-upload';
import { usePresignAvatar } from '@/hooks/use-get-presign-avatar';
import Image from 'next/image';

function putFileToS3WithProgress(opts: {
    url: string;
    file: File;
    onProgress?: (pct: number) => void;
    signal?: AbortSignal;
}) {
    const { url, file, onProgress, signal } = opts;
    return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable && onProgress) {
                onProgress(Math.round((evt.loaded / evt.total) * 100));
            }
        };
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else
                reject(
                    new Error(
                        `S3 upload failed: ${xhr.status} ${xhr.statusText}`,
                    ),
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
        xhr.send(file);

        if (signal) {
            signal.addEventListener('abort', () => {
                try {
                    xhr.abort();
                } catch {}
            });
        }
    });
}

export default function FileUploadDirectUploadDemo() {
    const [files, setFiles] = React.useState<File[]>([]);
    const [progressMap, setProgressMap] = React.useState<
        Record<string, number>
    >({});
    const presignMutation = usePresignAvatar();

    // Auto-start upload whenever files are selected
    const handleValueChange = React.useCallback(
        async (newFiles: File[]) => {
            setFiles(newFiles);

            await Promise.all(
                newFiles.map(async (file) => {
                    const id = `${file.name}-${file.size}-${file.lastModified}`;
                    try {
                        // 1) presign
                        const presign = await presignMutation.mutateAsync({
                            fileName: file.name,
                            contentType:
                                file.type || 'application/octet-stream',
                        });

                        // 2) PUT S3 (progress — ta tự quản lý state để nhìn thấy %)
                        await putFileToS3WithProgress({
                            url: presign.uploadUrl,
                            file,
                            onProgress: (pct) =>
                                setProgressMap((m) => ({ ...m, [id]: pct })),
                        });

                        toast.success(`Uploaded: ${file.name}`);
                    } catch (e: any) {
                        toast.error(
                            e?.message || `Upload failed: ${file.name}`,
                        );
                    } finally {
                        setProgressMap((m) => ({ ...m, [id]: 100 }));
                    }
                }),
            );
        },
        [presignMutation],
    );

    return (
        <div>
            <Image
                width={40}
                height={50}
                alt={'abc'}
                src={`https://d33qmu3lctvpye.cloudfront.net/avatars/608f6a7c-5978-4f2c-aae5-9208a5541d8f/avatar-b8f1ea39-eb74-4e1b-bdde-a2883f14f29f-ec2.jpg?Expires=1760548429&Signature=hdMFcMuIwJme84S7CRRLKj3fQAxMcgVIzi7PenWRW4FiuYbvJ4hsSnsws-HSU1NHt0xLBNXsZJE3plUCiIcZCKZCnqLUMfKNLwDHUB9ABvF0c09Qco9eFOHloIX08hSRs52Mwd~m7TNJtlyi17~2E9~R0ye0CHAr0HHUAtTSVshKh77Lnue77h9Hahu3pSwd3YEaqJxchR09S-UK34HxuscSEMX-TBqNF3uPjVx4zjdbRF6hr7eLvkDoUp5C79SHtL~n-0TcyhXzQMSoP~7UlYLhloHymlr32B7L6uIiCrOEHvxpRrTOsvhKKJRXDmHFQ8y-2lklrO1NBwLBf4JpuA__&Key-Pair-Id=K2TNW66MV7S2RO`}
            />
        </div>
        // <FileUpload
        //     value={files}
        //     onValueChange={handleValueChange}
        //     // onUpload KHÔNG dùng nữa vì ta auto-run ở onValueChange:
        //     // onUpload={...}
        //     accept="image/*,audio/*,video/*"
        //     maxFiles={2}
        //     className="w-full max-w-md"
        //     multiple
        // >
        //     <FileUploadDropzone>
        //         <div className="flex flex-col items-center gap-1 text-center">
        //             <div className="flex items-center justify-center rounded-full border p-2.5">
        //                 <Upload className="text-muted-foreground size-6" />
        //             </div>
        //             <p className="text-sm font-medium">
        //                 Drag & drop files here
        //             </p>
        //             <p className="text-muted-foreground text-xs">
        //                 Or click to browse (max 2 files)
        //             </p>
        //         </div>
        //         <FileUploadTrigger asChild>
        //             <Button variant="outline" size="sm" className="mt-2 w-fit">
        //                 Browse files
        //             </Button>
        //         </FileUploadTrigger>
        //     </FileUploadDropzone>
        //
        //     <FileUploadList>
        //         {files.map((file, index) => {
        //             const id = `${file.name}-${file.size}-${file.lastModified}`;
        //             const pct = progressMap[id] ?? 0;
        //             return (
        //                 <FileUploadItem
        //                     key={index}
        //                     value={file}
        //                     className="flex-col"
        //                 >
        //                     <div className="flex w-full items-center gap-2">
        //                         <FileUploadItemPreview />
        //                         <FileUploadItemMetadata />
        //                         <div className="ml-auto text-xs tabular-nums">
        //                             {pct}%
        //                         </div>
        //                         <FileUploadItemDelete asChild>
        //                             <Button
        //                                 variant="ghost"
        //                                 size="icon"
        //                                 className="size-7"
        //                             >
        //                                 <X />
        //                             </Button>
        //                         </FileUploadItemDelete>
        //                     </div>
        //                     {/* FileUploadItemProgress dùng context của lib; ở flow này ta hiển thị % đơn giản ở trên */}
        //                     {/* <FileUploadItemProgress /> */}
        //                     <div className="bg-muted h-1 w-full rounded">
        //                         <div
        //                             className="bg-primary h-1 rounded"
        //                             style={{ width: `${pct}%` }}
        //                         />
        //                     </div>
        //                 </FileUploadItem>
        //             );
        //         })}
        //     </FileUploadList>
        //
        //
        //    //https://d33qmu3lctvpye.cloudfront.net/avatars/608f6a7c-5978-4f2c-aae5-9208a5541d8f/avatar-b8f1ea39-eb74-4e1b-bdde-a2883f14f29f-ec2.jpg?Expires=1760548429&Signature=hdMFcMuIwJme84S7CRRLKj3fQAxMcgVIzi7PenWRW4FiuYbvJ4hsSnsws-HSU1NHt0xLBNXsZJE3plUCiIcZCKZCnqLUMfKNLwDHUB9ABvF0c09Qco9eFOHloIX08hSRs52Mwd~m7TNJtlyi17~2E9~R0ye0CHAr0HHUAtTSVshKh77Lnue77h9Hahu3pSwd3YEaqJxchR09S-UK34HxuscSEMX-TBqNF3uPjVx4zjdbRF6hr7eLvkDoUp5C79SHtL~n-0TcyhXzQMSoP~7UlYLhloHymlr32B7L6uIiCrOEHvxpRrTOsvhKKJRXDmHFQ8y-2lklrO1NBwLBf4JpuA__&Key-Pair-Id=K2TNW66MV7S2RO />
        // </FileUpload>
    );
}
