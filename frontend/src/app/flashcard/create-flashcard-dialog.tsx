import { useState } from 'react';
import { Plus, FileUp, PenLine, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
import { fileIdOf } from '@/lib/service/s3-upload';
import { useRouter } from 'next/navigation';
import { fetchWrapper } from '@/lib/service';

export default function CreateFlashcardDialog() {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'select' | 'import'>('select');
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progressMap, setProgressMap] = useState<Record<string, number>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const router = useRouter();

    const handleManualCreate = () => {
        router.push('/flashcard/new');
        setOpen(false);
    };

    const handleImportMode = () => {
        setMode('import');
    };

    const handleBack = () => {
        setMode('select');
        setFiles([]);
        setProgressMap({});
        setErrors({});
    };

    const handleValueChange = (next: File[]) => {
        setFiles(next);
    };

    const uploadFileToS3 = async (file: File): Promise<string | null> => {
        const id = fileIdOf(file);

        try {
            // Step 1: Get presigned URL
            const presignResponse = await fetchWrapper(
                '/v1/flashcards/Document-upload-url',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fileName: file.name,
                        contentType: file.type || 'application/octet-stream',
                    }),
                },
            );

            if (!presignResponse.ok) {
                throw new Error('Failed to get upload URL');
            }

            const presignData = await presignResponse.json();

            if (!presignData.uploadUrl || !presignData.s3Key) {
                throw new Error('Invalid presign response');
            }

            // Step 2: Upload file to S3
            setProgressMap((m) => ({ ...m, [id]: 0 }));

            const uploadResponse = await fetch(presignData.uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type || 'application/octet-stream',
                },
                body: file,
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload file');
            }

            setProgressMap((m) => ({ ...m, [id]: 100 }));

            return presignData.s3Key;
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Upload failed';
            setErrors((e) => ({ ...e, [id]: message }));
            return null;
        }
    };

    const handleStartUpload = async () => {
        if (!files.length) return;

        try {
            setIsUploading(true);

            // Upload first file
            const s3Key = await uploadFileToS3(files[0]);

            if (!s3Key) {
                throw new Error('Failed to upload file');
            }

            setIsUploading(false);
            setIsGenerating(true);

            // Generate flashcards from uploaded document
            const response = await fetchWrapper(
                '/v1/flashcards/FlashCard-generate',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        set_id: 'string',
                        user_id: 'string',
                        document_id: 'string',
                        pdf_url: s3Key,
                        num_cards: 10,
                        difficulty: 'MEDIUM',
                    }),
                },
            );

            if (!response.ok) {
                throw new Error('Failed to generate flashcards');
            }

            const data = await response.json();

            if (data.id) {
                localStorage.setItem(`deck:${data.id}`, JSON.stringify(data));
                router.push(`/flashcard/${data.id}`);
                setOpen(false);
            } else {
                throw new Error('No deck ID returned');
            }
        } catch (error) {
            console.error('Error generating flashcards:', error);
            alert(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setIsGenerating(false);
            setIsUploading(false);
            setMode('select');
            setFiles([]);
            setProgressMap({});
            setErrors({});
        }
    };

    const handleRemoveFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);

        // Clear progress and errors for removed file
        if (files[index]) {
            const id = fileIdOf(files[index]);
            setProgressMap((m) => {
                const { [id]: _, ...rest } = m;
                return rest;
            });
            setErrors((e) => {
                const { [id]: _, ...rest } = e;
                return rest;
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="cursor-pointer rounded-xl bg-blue-600 font-medium text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Deck
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                {mode === 'select' ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Create Flashcard Deck</DialogTitle>
                            <DialogDescription>
                                Choose how you want to create your flashcard
                                deck
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <button
                                onClick={handleManualCreate}
                                className="group flex items-start gap-4 rounded-lg border-2 border-slate-200 p-6 text-left transition-all hover:border-blue-500 hover:bg-blue-50"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                    <PenLine className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900">
                                        Create Manually
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Build your flashcard deck from scratch
                                        with custom questions and answers
                                    </p>
                                </div>
                            </button>

                            <button
                                onClick={handleImportMode}
                                className="group flex items-start gap-4 rounded-lg border-2 border-slate-200 p-6 text-left transition-all hover:border-green-500 hover:bg-green-50"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 transition-colors group-hover:bg-green-600 group-hover:text-white">
                                    <FileUp className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900">
                                        Import Document
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Upload a document and let AI generate
                                        flashcards automatically
                                    </p>
                                </div>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Import Document</DialogTitle>
                            <DialogDescription>
                                Upload your document to generate flashcards
                                automatically
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <FileUpload
                                value={files}
                                onValueChange={handleValueChange}
                                accept=".pdf,.doc,.docx"
                                maxFiles={1}
                                className="w-full"
                                multiple={false}
                            >
                                <FileUploadDropzone>
                                    <div className="flex flex-col items-center gap-1 text-center">
                                        <div className="flex items-center justify-center rounded-full border p-2.5">
                                            <Upload className="text-muted-foreground size-6" />
                                        </div>
                                        <p className="text-sm font-medium">
                                            Drag & drop file here
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            Or click to browse (PDF, DOC, DOCX)
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
                                                    <FileUploadItemDelete
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-7"
                                                            disabled={
                                                                isUploading ||
                                                                isGenerating
                                                            }
                                                            onClick={() =>
                                                                handleRemoveFile(
                                                                    index,
                                                                )
                                                            }
                                                        >
                                                            <X />
                                                        </Button>
                                                    </FileUploadItemDelete>
                                                </div>

                                                <div className="bg-muted h-1 w-full rounded">
                                                    <div
                                                        className="bg-primary h-1 rounded transition-all"
                                                        style={{
                                                            width: `${pct}%`,
                                                        }}
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
                                                                ? 'Uploaded'
                                                                : isUploading
                                                                  ? 'Uploading…'
                                                                  : 'Ready'}
                                                        </span>
                                                    )}
                                                </div>
                                            </FileUploadItem>
                                        );
                                    })}
                                </FileUploadList>
                            </FileUpload>

                            <div className="mt-4 flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleBack}
                                    disabled={isUploading || isGenerating}
                                    className="flex-1"
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={handleStartUpload}
                                    disabled={
                                        !files.length ||
                                        isUploading ||
                                        isGenerating
                                    }
                                    className="flex-1"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : isUploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading…
                                        </>
                                    ) : (
                                        'Upload & Generate'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
