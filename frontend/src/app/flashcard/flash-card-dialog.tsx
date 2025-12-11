import { useState } from 'react';
import { Plus, FileUp, PenLine, Upload, X } from 'lucide-react';
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
import { useS3Upload, fileIdOf } from '@/lib/service/s3-upload';
import { useRouter } from 'next/navigation';

export default function CreateFlashcardDialog() {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'select' | 'import'>('select');
    const [files, setFiles] = useState<File[]>([]);
    const router = useRouter();

    const { uploadFiles, cancel, cancelAll, isUploading, progressMap, errors } =
        useS3Upload({
            presignEndpoint: '/v1/flashcards/Document-upload-url',
        });

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
    };

    const handleValueChange = (next: File[]) => {
        setFiles(next);
    };

    const handleStartUpload = async () => {
        if (!files.length) return;
        await uploadFiles(files);
        // Handle post-upload logic here
        setOpen(false);
        setMode('select');
        setFiles([]);
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
                                Upload your documents to generate flashcards
                                automatically
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <FileUpload
                                value={files}
                                onValueChange={handleValueChange}
                                accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
                                maxFiles={2}
                                className="w-full"
                                multiple={true}
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
                                                            onClick={() =>
                                                                cancel(id)
                                                            }
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

                            <div className="mt-4 flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleBack}
                                    disabled={isUploading}
                                    className="flex-1"
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={handleStartUpload}
                                    disabled={!files.length || isUploading}
                                    className="flex-1"
                                >
                                    {isUploading
                                        ? 'Uploading…'
                                        : 'Upload & Generate'}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
