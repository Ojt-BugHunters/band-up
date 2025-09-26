'use client';

import { Mic } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AIVoiceInputProps {
    onStart?: () => void;
    onStop?: (file: File, duration: number) => void;
    visualizerBars?: number;
    className?: string;
}

export function VoiceInput({
    onStart,
    onStop,
    visualizerBars = 48,
    className,
}: AIVoiceInputProps) {
    const [recording, setRecording] = useState(false);
    const [time, setTime] = useState(0);
    const [isClient, setIsClient] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunks = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunks.current = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks.current, { type: 'audio/webm' });
            const file = new File([blob], `recording-${Date.now()}.webm`, {
                type: 'audio/webm',
            });
            onStop?.(file, time);
            setTime(0);
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
        };

        mediaRecorder.start();
        setRecording(true);
        onStart?.();

        timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const handleClick = () => {
        if (!recording) {
            startRecording();
        } else {
            stopRecording();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={cn('w-full py-4', className)}>
            <div className="relative mx-auto flex w-full max-w-xl flex-col items-center gap-2">
                <button
                    className={cn(
                        'group flex h-16 w-16 items-center justify-center rounded-xl transition-colors',
                        recording
                            ? 'bg-none'
                            : 'bg-none hover:bg-black/10 dark:hover:bg-white/10',
                    )}
                    type="button"
                    onClick={handleClick}
                >
                    {recording ? (
                        <div
                            className="pointer-events-auto h-6 w-6 animate-spin cursor-pointer rounded-sm bg-black dark:bg-white"
                            style={{ animationDuration: '3s' }}
                        />
                    ) : (
                        <Mic className="h-6 w-6 text-black/70 dark:text-white/70" />
                    )}
                </button>

                <span
                    className={cn(
                        'font-mono text-sm transition-opacity duration-300',
                        recording
                            ? 'text-black/70 dark:text-white/70'
                            : 'text-black/30 dark:text-white/30',
                    )}
                >
                    {formatTime(time)}
                </span>

                <div className="flex h-4 w-64 items-center justify-center gap-0.5">
                    {[...Array(visualizerBars)].map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                'w-0.5 rounded-full transition-all duration-300',
                                recording
                                    ? 'animate-pulse bg-black/50 dark:bg-white/50'
                                    : 'h-1 bg-black/10 dark:bg-white/10',
                            )}
                            style={
                                recording && isClient
                                    ? {
                                          height: `${20 + Math.random() * 80}%`,
                                          animationDelay: `${i * 0.05}s`,
                                      }
                                    : undefined
                            }
                        />
                    ))}
                </div>

                <p className="h-4 text-xs text-black/70 dark:text-white/70">
                    {recording ? 'Recording...' : 'Click to speak'}
                </p>

                {audioUrl && (
                    <div className="mt-4 w-full">
                        <div className="bg-card rounded-lg border p-4 shadow-sm">
                            <p className="text-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-500" />
                                Recording Preview
                            </p>
                            <audio
                                controls
                                src={audioUrl}
                                className="bg-background w-full rounded-md border"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
