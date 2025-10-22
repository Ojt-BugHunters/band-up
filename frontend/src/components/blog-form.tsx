'use client';

import {
    type CreateBlogFormValues,
    useCreateBlog,
} from '@/hooks/use-create-blog';
import { Upload, X } from 'lucide-react';
import { useUpdateBlog } from '@/hooks/use-update-blog';
import { useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { type Tag, TagInput } from 'emblor';
import { Card } from './ui/card';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { MinimalTiptapEditor } from './ui/minimal-tiptap';
import type { Content } from '@tiptap/react';
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
import React from 'react';
import { toast } from 'sonner';
import { usePresignUpload } from '@/hooks/use-get-presign-upload';

type BlogFormMode = 'create' | 'update';

type BlogFormProps = {
    mode: BlogFormMode;
    initialValues?: Partial<CreateBlogFormValues> & { id?: string };
    submitText?: string;
};

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

export default function BlogForm({
    mode,
    initialValues,
    submitText,
}: BlogFormProps) {
    const [files, setFiles] = React.useState<File[]>([]);
    const isUpdate = mode === 'update';
    const create = useCreateBlog();
    const update = useUpdateBlog(initialValues?.id ?? '');
    const { form, mutation } = isUpdate ? update : create;
    const [tags, setTags] = React.useState<Tag[]>([]);
    const [activeTagIndex, setActiveTagIndex] = React.useState<number | null>(
        null,
    );
    const { setValue } = form;
    const [progressMap, setProgressMap] = React.useState<
        Record<string, number>
    >({});

    const safeDefaults: CreateBlogFormValues = useMemo(
        () => ({
            title: initialValues?.title ?? '',
            description: initialValues?.description ?? '',
            topics: initialValues?.topics ?? [],
        }),
        [initialValues],
    );

    useEffect(() => {
        form.reset(safeDefaults, {
            keepDirty: false,
            keepTouched: false,
        });
    }, [isUpdate, safeDefaults, form]);

    const onSubmit = (data: CreateBlogFormValues) => {
        if (isUpdate && initialValues?.id) {
            mutation.mutate(data);
        } else {
            mutation.mutate(data);
        }
    };

    const pending = mutation.isPending;
    const presignMutation = usePresignUpload();

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

                        // 2) PUT S3
                        await putFileToS3WithProgress({
                            url: presign.uploadUrl,
                            file,
                            onProgress: (pct) =>
                                setProgressMap((m) => ({ ...m, [id]: pct })),
                        });

                        toast.success(`Uploaded: ${file.name}`);
                    } catch (e: unknown) {
                        const message =
                            e instanceof Error
                                ? e.message
                                : `Upload failed: ${file.name}`;
                        toast.error(message);
                    } finally {
                        setProgressMap((m) => ({ ...m, [id]: 100 }));
                    }
                }),
            );
        },
        [presignMutation],
    );

    return (
        <div className="mx-auto max-w-6xl p-6 md:p-8">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {isUpdate ? 'Update Blog' : 'Create New Blog'}
                            </h1>
                            <p className="text-muted-foreground">
                                {isUpdate
                                    ? 'Modify your blog'
                                    : 'Start creating your blog'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                disabled={pending}
                                className="bg-primary hover:bg-primary/90"
                            >
                                {pending
                                    ? isUpdate
                                        ? 'Updating...'
                                        : 'Creating...'
                                    : submitText ||
                                      (isUpdate ? 'Update' : 'Create')}
                            </Button>
                        </div>
                    </div>

                    <Card className="border-border bg-card p-6">
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold">
                                            Title
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter blog title..."
                                                className="bg-background text-lg"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold">
                                            Content
                                        </FormLabel>
                                        <FormControl>
                                            <MinimalTiptapEditor
                                                value={field.value as Content}
                                                onChange={(
                                                    content: Content,
                                                ) => {
                                                    field.onChange(content);
                                                }}
                                                output="html"
                                                placeholder="Write contents..."
                                                autofocus={false}
                                                editable={true}
                                                editorContentClassName="p-4"
                                                className="min-h-[200px]"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FileUpload
                            value={files}
                            onValueChange={handleValueChange}
                            accept="image/*,audio/*,video/*"
                            maxFiles={2}
                            className="w-full"
                            multiple
                        >
                            <FileUploadDropzone className="w-full">
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
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 w-fit bg-transparent"
                                    >
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

                        <FormField
                            control={form.control}
                            name="topics"
                            render={({ field }) => (
                                <FormItem className="mt-6 flex flex-col items-start">
                                    <FormLabel className="text-base font-semibold">
                                        Topics
                                    </FormLabel>
                                    <FormControl>
                                        <TagInput
                                            {...field}
                                            placeholder="Enter a topic"
                                            tags={tags}
                                            className="sm:min-w-[450px]"
                                            setTags={(newTags) => {
                                                setTags(newTags);
                                                setValue(
                                                    'topics',
                                                    newTags as [Tag, ...Tag[]],
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        These are the topics that you&apos;re
                                        interested in.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </Card>
                </form>
            </Form>
        </div>
    );
}
