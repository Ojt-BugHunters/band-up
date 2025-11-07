import SpeakingPractice from '@/components/speaking-practice';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    FileUpload,
    FileUploadDropzone,
    FileUploadItem,
    FileUploadItemDelete,
    FileUploadItemMetadata,
    FileUploadItemPreview,
    FileUploadItemProgress,
    FileUploadList,
    FileUploadProps,
    FileUploadTrigger,
} from '@/components/ui/file-upload';
import { VoiceInput } from '@/components/voice-input';
import WritingPractice from '@/components/writing-practice';
import { MessageSquare, Mic, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export function AIChatDisplay() {
    const [chatTab, setChatTab] = useState<'writing' | 'speaking'>('writing');
    const [files, setFiles] = useState<File[]>([]);

    const onUpload: NonNullable<FileUploadProps['onUpload']> = useCallback(
        async (files, { onProgress, onSuccess, onError }) => {
            try {
                const uploadPromises = files.map(async (file) => {
                    try {
                        const totalChunks = 10;
                        let uploadedChunks = 0;
                        for (let i = 0; i < totalChunks; i++) {
                            await new Promise((resolve) =>
                                setTimeout(resolve, Math.random() * 200 + 100),
                            );

                            uploadedChunks++;
                            const progress =
                                (uploadedChunks / totalChunks) * 100;
                            onProgress(file, progress);
                        }

                        await new Promise((resolve) =>
                            setTimeout(resolve, 500),
                        );
                        onSuccess(file);
                    } catch (error) {
                        onError(
                            file,
                            error instanceof Error
                                ? error
                                : new Error('Upload failed'),
                        );
                    }
                });

                await Promise.all(uploadPromises);
            } catch (error) {
                toast.error('Unexpected error during upload');
                console.log(error);
            }
        },
        [],
    );

    const onFileReject = useCallback((file: File, message: string) => {
        toast(message, {
            description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
        });
    }, []);

    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center justify-between p-6">
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700/50 bg-zinc-800/80 shadow-lg shadow-black/20 backdrop-blur-md">
                        <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-xl font-semibold text-white drop-shadow-lg">
                        AI Assistant
                    </h1>
                </div>

                <Avatar className="h-10 w-10 border-2 border-zinc-700/50 shadow-lg shadow-black/20">
                    <AvatarFallback className="bg-zinc-800/80 text-white backdrop-blur-md">
                        ND
                    </AvatarFallback>
                </Avatar>
            </header>

            <main className="relative flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-24">
                {chatTab === 'writing' && (
                    <WritingPractice
                        title="Writing Practice"
                        taskNumber={1}
                        prompt="Some people believe that students should focus on STEM subjects, while others argue that arts and humanities are equally important. Discuss both views and give your own opinion."
                        notes="Aim for a balanced argument: introduce, compare viewpoints with examples, and conclude with your stance."
                        minWords={250}
                    />
                )}

                {chatTab === 'speaking' && (
                    <SpeakingPractice
                        title="IELTS Speaking"
                        partLabel="Part 2"
                        questions={[
                            'Describe a book you recently read and liked.',
                            'Explain why it impressed you and what you learned from it.',
                        ]}
                        notes="Aim to speak for 1–2 minutes. Try to use varied vocabulary and link ideas clearly."
                        onChangePrompt={() => {
                            console.log('Change speaking prompt');
                        }}
                        voiceInputSlot={
                            <VoiceInput
                                onStart={() => console.log('Recording started')}
                                onStop={(file, duration) => {
                                    console.log(
                                        'Recorded file:',
                                        file,
                                        'Duration:',
                                        duration,
                                    );
                                }}
                            />
                        }
                        fileUploadSlot={
                            <div className="w-full">
                                <div className="flex w-full items-center justify-center">
                                    <div className="mx-auto w-full max-w-xl">
                                        <FileUpload
                                            value={files}
                                            onValueChange={setFiles}
                                            onUpload={onUpload}
                                            onFileReject={onFileReject}
                                            maxFiles={2}
                                            multiple
                                            className="w-full"
                                        >
                                            <FileUploadDropzone className="w-full rounded-xl border border-dashed border-white/25 bg-black/30 p-6 text-white/80 backdrop-blur-xl transition hover:border-white/40 hover:bg-black/40">
                                                <div className="flex flex-col items-center gap-1 text-center">
                                                    <div className="flex items-center justify-center rounded-full border border-white/20 bg-black/40 p-2.5">
                                                        <Upload className="size-6 text-white/70" />
                                                    </div>
                                                    <p className="text-sm font-medium">
                                                        Drag &amp; drop files
                                                        here
                                                    </p>
                                                    <p className="text-xs text-white/50">
                                                        Or click to browse (max
                                                        2 files)
                                                    </p>

                                                    <FileUploadTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-3 w-fit rounded-xl border-white/10 bg-black/40 text-white shadow-[0_8px_25px_rgba(0,0,0,0.6),_0_2px_4px_rgba(255,255,255,0.08)_inset] backdrop-blur-xl hover:bg-black/55 hover:text-white"
                                                        >
                                                            Browse files
                                                        </Button>
                                                    </FileUploadTrigger>
                                                </div>
                                            </FileUploadDropzone>

                                            <FileUploadList className="mt-4">
                                                {files.map((file, index) => (
                                                    <FileUploadItem
                                                        key={index}
                                                        value={file}
                                                        className="flex-col"
                                                    >
                                                        <div className="flex w-full items-center gap-2">
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
                                                                </Button>
                                                            </FileUploadItemDelete>
                                                        </div>
                                                        <FileUploadItemProgress />
                                                    </FileUploadItem>
                                                ))}
                                            </FileUploadList>
                                        </FileUpload>
                                    </div>
                                </div>
                            </div>
                        }
                    />
                )}
                <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
                    <button
                        onClick={() => setChatTab('writing')}
                        className={`relative rounded-2xl border border-white/10 bg-black/40 p-3 shadow-[0_8px_25px_rgba(0,0,0,0.6),0_2px_4px_rgba(255,255,255,0.08)_inset] backdrop-blur-xl transition-all hover:scale-110 hover:bg-black/50 active:scale-95 ${
                            chatTab === 'writing'
                                ? 'ring-2 ring-emerald-400/60'
                                : ''
                        }`}
                    >
                        <div
                            className="pointer-events-none absolute -inset-px rounded-2xl opacity-40 blur-md"
                            style={{
                                background:
                                    'radial-gradient(120% 100% at 50% 120%, rgba(255,255,255,0.2), transparent 70%)',
                            }}
                        />
                        <div
                            className="pointer-events-none absolute inset-0 rounded-2xl opacity-40"
                            style={{
                                background:
                                    'linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(255,255,255,0.05) 40%, transparent 70%)',
                                maskImage:
                                    'radial-gradient(120% 100% at 50% -20%, black 50%, transparent 80%)',
                            }}
                        />
                        <MessageSquare className="relative z-10 h-5 w-5 text-white" />
                    </button>

                    <button
                        onClick={() => setChatTab('speaking')}
                        className={`relative rounded-2xl border border-white/10 bg-black/40 p-3 shadow-[0_8px_25px_rgba(0,0,0,0.6),0_2px_4px_rgba(255,255,255,0.08)_inset] backdrop-blur-xl transition-all hover:scale-110 hover:bg-black/50 active:scale-95 ${
                            chatTab === 'speaking'
                                ? 'ring-2 ring-indigo-400/60'
                                : ''
                        }`}
                    >
                        <div
                            className="pointer-events-none absolute -inset-px rounded-2xl opacity-40 blur-md"
                            style={{
                                background:
                                    'radial-gradient(120% 100% at 50% 120%, rgba(255,255,255,0.2), transparent 70%)',
                            }}
                        />
                        <div
                            className="pointer-events-none absolute inset-0 rounded-2xl opacity-40"
                            style={{
                                background:
                                    'linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(255,255,255,0.05) 40%, transparent 70%)',
                                maskImage:
                                    'radial-gradient(120% 100% at 50% -20%, black 50%, transparent 80%)',
                            }}
                        />
                        <Mic className="relative z-10 h-5 w-5 text-white" />
                    </button>
                </div>
            </main>
        </div>
    );
}
