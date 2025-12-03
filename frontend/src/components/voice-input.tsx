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
        if (!recording) startRecording();
        else stopRecording();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={cn('w-full py-4 text-white', className)}>
            <div className="relative mx-auto flex w-full max-w-xl flex-col items-center gap-3">
                <button
                    type="button"
                    onClick={handleClick}
                    className={cn(
                        'group flex h-16 w-16 items-center justify-center rounded-xl transition-colors',
                        recording ? 'bg-none' : 'bg-none hover:bg-white/10',
                    )}
                >
                    {recording ? (
                        <div
                            className="h-6 w-6 animate-spin rounded-sm bg-white"
                            style={{ animationDuration: '3s' }}
                        />
                    ) : (
                        <Mic className="h-7 w-7 text-white/90" />
                    )}
                </button>

                {/* Timer */}
                <span
                    className={cn(
                        'font-mono text-sm transition-opacity duration-300',
                        recording ? 'text-white/80' : 'text-white/40',
                    )}
                >
                    {formatTime(time)}
                </span>

                {/* Visualizer */}
                <div className="flex h-4 w-64 items-center justify-center gap-0.5">
                    {[...Array(visualizerBars)].map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                'w-0.5 rounded-full transition-all duration-300',
                                recording
                                    ? 'animate-pulse bg-white/70'
                                    : 'h-1 bg-white/15',
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

                {/* Status Text */}
                <p
                    className={cn(
                        'h-4 text-xs tracking-wide transition-opacity duration-300',
                        recording ? 'text-white/80' : 'text-white/60',
                    )}
                >
                    {recording ? 'Recording...' : 'Click to speak'}
                </p>

                {/* Audio Preview */}
                {audioUrl && (
                    <div className="mt-4 w-full">
                        <div className="rounded-lg border border-white/10 bg-black/40 p-4 shadow-md backdrop-blur-xl">
                            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-white/90">
                                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-400" />
                                Recording Preview
                            </p>
                            <audio
                                controls
                                src={audioUrl}
                                className="w-full rounded-md border border-white/10 bg-black/30 text-white"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
