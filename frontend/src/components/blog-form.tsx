import {
    CreateDeckFormValues,
    useCreateDeck,
} from '@/hooks/use-create-deck-card';
import { useUpdateDeck } from '@/hooks/use-update-deck-card';
import { useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { MinimalTiptapEditor } from './ui/minimal-tiptap';
import { Content } from '@tiptap/react';
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

type DeckFormMode = 'create' | 'update';

type DeckFormProps = {
    mode: DeckFormMode;
    initialValues?: Partial<CreateDeckFormValues> & { id?: string };
    submitText?: string;
};

export default function BlogForm({
    mode,
    initialValues,
    submitText,
}: DeckFormProps) {
    const [files, setFiles] = React.useState<File[]>([]);
    const isUpdate = mode === 'update';
    const create = useCreateDeck();
    const update = useUpdateDeck(initialValues?.id ?? '');
    const { form, mutation } = isUpdate ? update : create;

    const safeDefaults: CreateDeckFormValues = useMemo(
        () => ({
            title: initialValues?.title ?? '',
            description: initialValues?.description ?? '',
            public: initialValues?.public ?? true,
            password: initialValues?.password ?? '',
            cards:
                initialValues?.cards && initialValues.cards.length > 0
                    ? initialValues.cards
                    : [{ front: '', back: '' }],
        }),
        [initialValues],
    );

    useEffect(() => {
        form.reset(safeDefaults, {
            keepDirty: false,
            keepTouched: false,
        });
    }, [isUpdate, safeDefaults, form]);

    const onSubmit = (data: CreateDeckFormValues) => {
        if (isUpdate && initialValues?.id) {
            mutation.mutate(data);
        } else {
            mutation.mutate(data);
        }
    };

    const pending = mutation.isPending;

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
                    </Card>
                </form>
            </Form>

            <FileUpload
                value={files}
                onValueChange={handleValueChange}
                // onUpload KHÔNG dùng nữa vì ta auto-run ở onValueChange:
                // onUpload={...}
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
        </div>
    );
}
