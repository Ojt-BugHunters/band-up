import { useFieldArray } from 'react-hook-form';
import { useCreatePassage } from '@/hooks/use-create-passage';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from './ui/form';
import {
    BookOpen,
    CloudUpload,
    Headphones,
    ImageIcon,
    Mic,
    Pencil,
    Plus,
    Sparkles,
    Upload,
    X,
} from 'lucide-react';
import { Badge } from './ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
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
import { TooltipProvider } from './ui/tooltip';
import { MinimalTiptapEditor } from './ui/minimal-tiptap';
import { TestType } from '@/lib/api/dto/test';

const testTypeConfig = {
    reading: {
        title: 'IELTS Reading',
        description:
            'Design comprehensive IELTS reading materials with structured content and multimedia support',
        maxPassages: 3,
        colors: {
            badge: 'bg-blue-500 text-white hover:bg-blue-600',
            card: 'border-blue-200 hover:border-blue-400',
            cardHeader: 'bg-blue-50/50',
            number: 'bg-blue-500 text-white',
            border: 'bg-blue-200/50',
        },
        icon: BookOpen,
        iconColor: 'text-blue-600',
    },
    listening: {
        title: 'IELTS Listening',
        description:
            'Create IELTS listening exercises with audio files and comprehensive content',
        maxPassages: 4,
        colors: {
            badge: 'bg-green-500 text-white hover:bg-green-600',
            card: 'border-green-200 hover:border-green-400',
            cardHeader: 'bg-green-50/50',
            number: 'bg-green-500 text-white',
            border: 'bg-green-200/50',
        },
        icon: Headphones,
        iconColor: 'text-green-600',
    },
    writing: {
        title: 'IELTS Writing',
        description:
            'Develop IELTS writing tasks with detailed prompts and supporting materials',
        maxPassages: 2,
        colors: {
            badge: 'bg-purple-500 text-white hover:bg-purple-600',
            card: 'border-purple-200 hover:border-purple-400',
            cardHeader: 'bg-purple-50/50',
            number: 'bg-purple-500 text-white',
            border: 'bg-purple-200/50',
        },
        icon: Pencil,
        iconColor: 'text-purple-600',
    },
    speaking: {
        title: 'IELTS Speaking',
        description:
            'Build IELTS speaking prompts with contextual content and visual aids',
        maxPassages: 2,
        colors: {
            badge: 'bg-orange-500 text-white hover:bg-orange-600',
            card: 'border-orange-200 hover:border-orange-400',
            cardHeader: 'bg-orange-50/50',
            number: 'bg-orange-500 text-white',
            border: 'bg-orange-200/50',
        },
        icon: Mic,
        iconColor: 'text-orange-600',
    },
};

type TestTypeKey = keyof typeof testTypeConfig;

export function CreateSectionForm({ testType }: { testType: TestType }) {
    return (
        <div>
            <SectionForm testType={testType} />;
        </div>
    );
}

function SectionForm({ testType }: { testType: TestTypeKey }) {
    const { sectionForm } = useCreatePassage();
    const config = testTypeConfig[testType];
    const IconComponent = config.icon;

    const { fields, append } = useFieldArray({
        control: sectionForm.control,
        name: 'section',
    });

    // const onSubmit = React.useCallback((data: any) => {
    //     console.log('Submitted values:', data);

    //     toast('Submitted values:', {
    //         description: (
    //             <pre className="bg-accent/30 text-accent-foreground mt-2 w-[500px] rounded-md p-4">
    //                 <code>{JSON.stringify(data, null, 2)}</code>
    //             </pre>
    //         ),
    //     });
    // }, []);
    const onSubmit = () => {};

    const addPassage = () => {
        if (fields.length < config.maxPassages) {
            append({
                title: '',
                orderIndex: fields.length + 1,
                metadata: {
                    content: '',
                    image: { files: [] },
                    audio: { files: [] },
                },
            });
        }
    };

    return (
        <TooltipProvider>
            <Form {...sectionForm}>
                <form
                    onSubmit={sectionForm.handleSubmit(onSubmit)}
                    className="space-y-12"
                >
                    <div className="flex items-end justify-between gap-6">
                        <div className="space-y-4">
                            <div
                                className={`inline-flex items-center gap-3 rounded-md px-4 py-1.5 text-sm font-semibold ${config.colors.badge}`}
                            >
                                <IconComponent className="h-4 w-4" />
                                {config.title}
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight">
                                Create{' '}
                                {testType.charAt(0).toUpperCase() +
                                    testType.slice(1)}{' '}
                                Passages
                            </h1>
                            <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
                                {config.description}
                            </p>
                        </div>
                        <Badge
                            variant="outline"
                            className="rounded-md border px-4 py-1.5 font-mono text-sm"
                        >
                            {fields.length} / {config.maxPassages}
                        </Badge>
                    </div>

                    <div className="space-y-8">
                        {fields.map((field, index) => (
                            <Card
                                key={field.id}
                                className={`rounded-xl border shadow-sm transition-colors ${config.colors.card}`}
                            >
                                <CardHeader
                                    className={`border-b p-6 ${config.colors.cardHeader}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-md font-mono text-lg font-bold ${config.colors.number}`}
                                            >
                                                {index + 1}
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl font-semibold">
                                                    Passage {index + 1}
                                                </CardTitle>
                                                <CardDescription className="text-muted-foreground text-sm">
                                                    Complete all required
                                                    information
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-8 pt-4 pl-8">
                                    <FormField
                                        control={sectionForm.control}
                                        name={`section.${index}.title`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold tracking-wide uppercase">
                                                    Title{' '}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <Input
                                                    placeholder="Enter passage title"
                                                    className="focus:border-primary focus:ring-primary/20 h-11 rounded-md border focus:ring-2"
                                                    {...field}
                                                />
                                                <FormMessage className="animate-in fade-in slide-in-from-top-1 duration-200" />
                                            </FormItem>
                                        )}
                                    />

                                    <Separator
                                        className={config.colors.border}
                                    />

                                    <FormField
                                        control={sectionForm.control}
                                        name={`section.${index}.metadata.content`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold tracking-wide uppercase">
                                                    Content{' '}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <MinimalTiptapEditor
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    className="h-full min-h-40 w-full"
                                                    output="html"
                                                    placeholder="Enter the content of the passage..."
                                                    autofocus={false}
                                                    editable={true}
                                                    editorContentClassName="p-5 min-h-40 cursor-text"
                                                    editorClassName="focus:outline-hidden min-h-40"
                                                />
                                                <div className="flex items-center justify-between text-sm">
                                                    <FormMessage className="animate-in fade-in slide-in-from-top-1 duration-200" />
                                                    <span className="text-muted-foreground bg-muted rounded-full px-3 py-1 font-mono">
                                                        {field.value?.length ||
                                                            0}{' '}
                                                        / 10,000
                                                    </span>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <Separator
                                        className={config.colors.border}
                                    />

                                    <div className="bg-muted/30 border-border/50 space-y-6 rounded-2xl border p-6">
                                        <h4 className="text-muted-foreground flex items-center gap-2 text-sm font-bold tracking-wide uppercase">
                                            <div className="bg-foreground h-1 w-1 rounded-full" />
                                            Media Attachments
                                        </h4>

                                        <div className="grid gap-6 md:grid-cols-2">
                                            <FormField
                                                control={sectionForm.control}
                                                name={`section.${index}.metadata.image`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                                                            <ImageIcon className="h-4 w-4" />
                                                            Image Attachment
                                                            (Optional)
                                                        </FormLabel>
                                                        <FormControl>
                                                            <FileUpload
                                                                value={
                                                                    field.value
                                                                        ?.files
                                                                }
                                                                onValueChange={(
                                                                    files,
                                                                ) =>
                                                                    field.onChange(
                                                                        {
                                                                            ...field.value,
                                                                            files,
                                                                        },
                                                                    )
                                                                }
                                                                accept="image/*"
                                                                maxFiles={2}
                                                                maxSize={
                                                                    5 *
                                                                    1024 *
                                                                    1024
                                                                }
                                                                onFileReject={(
                                                                    _,
                                                                    message,
                                                                ) => {
                                                                    sectionForm.setError(
                                                                        `section.${index}.metadata.image.files`,
                                                                        {
                                                                            message,
                                                                        },
                                                                    );
                                                                }}
                                                            >
                                                                <FileUploadDropzone className="flex-row flex-wrap border-dotted text-center">
                                                                    <CloudUpload className="size-4" />
                                                                    Drag and
                                                                    drop or
                                                                    <FileUploadTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            variant="link"
                                                                            size="sm"
                                                                            className="p-0"
                                                                        >
                                                                            choose
                                                                            files
                                                                        </Button>
                                                                    </FileUploadTrigger>
                                                                    to upload
                                                                </FileUploadDropzone>
                                                                <FileUploadList>
                                                                    {field.value?.files?.map(
                                                                        (
                                                                            file,
                                                                            index,
                                                                        ) => (
                                                                            <FileUploadItem
                                                                                key={
                                                                                    index
                                                                                }
                                                                                value={
                                                                                    file
                                                                                }
                                                                            >
                                                                                <FileUploadItemPreview />
                                                                                <FileUploadItemMetadata />
                                                                                <FileUploadItemDelete
                                                                                    asChild
                                                                                >
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        className="size-7"
                                                                                    >
                                                                                        <X />
                                                                                        <span className="sr-only">
                                                                                            Delete
                                                                                        </span>
                                                                                    </Button>
                                                                                </FileUploadItemDelete>
                                                                            </FileUploadItem>
                                                                        ),
                                                                    )}
                                                                </FileUploadList>
                                                            </FileUpload>
                                                        </FormControl>
                                                        <FormDescription>
                                                            Upload one image up
                                                            to 5MB each
                                                        </FormDescription>
                                                        <FormMessage className="animate-in fade-in slide-in-from-top-1 duration-200" />
                                                    </FormItem>
                                                )}
                                            />

                                            {testType === 'listening' && (
                                                <FormField
                                                    control={
                                                        sectionForm.control
                                                    }
                                                    name={`section.${index}.metadata.audio`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                                                                <Headphones className="h-4 w-4" />
                                                                Audio File{' '}
                                                                <span className="text-destructive">
                                                                    *
                                                                </span>
                                                            </FormLabel>
                                                            <FormControl>
                                                                <FileUpload
                                                                    value={
                                                                        field
                                                                            .value
                                                                            ?.files
                                                                    }
                                                                    onValueChange={(
                                                                        files,
                                                                    ) =>
                                                                        field.onChange(
                                                                            {
                                                                                ...field.value,
                                                                                files,
                                                                            },
                                                                        )
                                                                    }
                                                                    accept="audio/*"
                                                                    maxFiles={1}
                                                                    maxSize={
                                                                        10 *
                                                                        1024 *
                                                                        1024
                                                                    }
                                                                    onFileReject={(
                                                                        _,
                                                                        message,
                                                                    ) => {
                                                                        sectionForm.setError(
                                                                            `section.${index}.metadata.audio.files`,
                                                                            {
                                                                                message,
                                                                            },
                                                                        );
                                                                    }}
                                                                >
                                                                    <FileUploadDropzone className="flex-row flex-wrap border-dotted text-center">
                                                                        <CloudUpload className="size-4" />
                                                                        Drag and
                                                                        drop or
                                                                        <FileUploadTrigger
                                                                            asChild
                                                                        >
                                                                            <Button
                                                                                variant="link"
                                                                                size="sm"
                                                                                className="p-0"
                                                                            >
                                                                                choose
                                                                                audio
                                                                            </Button>
                                                                        </FileUploadTrigger>
                                                                        to
                                                                        upload
                                                                    </FileUploadDropzone>
                                                                    <FileUploadList>
                                                                        {field.value?.files?.map(
                                                                            (
                                                                                file,
                                                                                fileIndex,
                                                                            ) => (
                                                                                <FileUploadItem
                                                                                    key={
                                                                                        fileIndex
                                                                                    }
                                                                                    value={
                                                                                        file
                                                                                    }
                                                                                >
                                                                                    <FileUploadItemPreview />
                                                                                    <FileUploadItemMetadata />
                                                                                    <FileUploadItemDelete
                                                                                        asChild
                                                                                    >
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            className="size-7"
                                                                                        >
                                                                                            <X />
                                                                                            <span className="sr-only">
                                                                                                Delete
                                                                                            </span>
                                                                                        </Button>
                                                                                    </FileUploadItemDelete>
                                                                                </FileUploadItem>
                                                                            ),
                                                                        )}
                                                                    </FileUploadList>
                                                                </FileUpload>
                                                            </FormControl>
                                                            <FormDescription>
                                                                Upload audio
                                                                file up to 10MB
                                                            </FormDescription>
                                                            <FormMessage className="animate-in fade-in slide-in-from-top-1 duration-200" />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {fields.length < config.maxPassages && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addPassage}
                            className="text-muted-foreground hover:border-primary hover:text-primary h-20 w-full rounded-md border border-dashed text-base font-medium"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Add Passage {fields.length + 1}
                        </Button>
                    )}

                    {sectionForm.formState.errors.section?.root && (
                        <div className="border-destructive bg-destructive/5 animate-in fade-in slide-in-from-top-2 rounded-2xl border-2 p-6 duration-300">
                            <p className="text-sm font-semibold">
                                {
                                    sectionForm.formState.errors.section.root
                                        .message
                                }
                            </p>
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-6 border-t pt-8">
                        <Button
                            type="submit"
                            size="lg"
                            className="h-11 rounded-md px-10 font-medium"
                            disabled={sectionForm.formState.isSubmitting}
                        >
                            {sectionForm.formState.isSubmitting ? (
                                <>
                                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Passages...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Create Passages
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </TooltipProvider>
    );
}
