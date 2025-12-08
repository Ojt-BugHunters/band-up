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
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunks = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const isDark = theme === 'dark';

    useEffect(() => {
        setIsClient(true);

        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('theme');
            if (stored === 'dark' || stored === 'light') {
                setTheme(stored);
            }
            window.addEventListener('storage', (e) => {
                if (
                    e.key === 'theme' &&
                    (e.newValue === 'dark' || e.newValue === 'light')
                ) {
                    setTheme(e.newValue);
                }
            });
        }
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
        return `${mins.toString().padStart(2, '0')}:${secs
            .toString()
            .padStart(2, '0')}`;
    };

    return (
        <div
            className={cn(
                'w-full py-4',
                isDark ? 'text-white' : 'text-slate-900',
                className,
            )}
        >
            <div className="relative mx-auto flex w-full max-w-xl flex-col items-center gap-3">
                <button
                    type="button"
                    onClick={handleClick}
                    className={cn(
                        'group flex h-16 w-16 items-center justify-center rounded-xl border transition-colors',
                        recording
                            ? isDark
                                ? 'border-white/70 bg-transparent'
                                : 'border-slate-900/70 bg-transparent'
                            : isDark
                              ? 'border-white/25 bg-white/10 hover:bg-white/20'
                              : 'border-slate-300 bg-slate-100 hover:bg-slate-200',
                    )}
                >
                    {recording ? (
                        <div
                            className={cn(
                                'h-6 w-6 animate-spin rounded-sm',
                                isDark ? 'bg-white' : 'bg-slate-900',
                            )}
                            style={{ animationDuration: '3s' }}
                        />
                    ) : (
                        <Mic
                            className={cn(
                                'h-7 w-7',
                                isDark ? 'text-white/90' : 'text-slate-900',
                            )}
                        />
                    )}
                </button>

                <span
                    className={cn(
                        'font-mono text-sm transition-opacity duration-300',
                        recording
                            ? isDark
                                ? 'text-white/80'
                                : 'text-slate-900'
                            : isDark
                              ? 'text-white/40'
                              : 'text-slate-500',
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
                                    ? isDark
                                        ? 'animate-pulse bg-white/70'
                                        : 'animate-pulse bg-slate-900/70'
                                    : isDark
                                      ? 'h-1 bg-white/15'
                                      : 'h-1 bg-slate-300',
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

                <p
                    className={cn(
                        'h-4 text-xs tracking-wide transition-opacity duration-300',
                        recording
                            ? isDark
                                ? 'text-white/80'
                                : 'text-slate-900'
                            : isDark
                              ? 'text-white/60'
                              : 'text-slate-500',
                    )}
                >
                    {recording ? 'Recording...' : 'Click to speak'}
                </p>

                {audioUrl && (
                    <div className="mt-4 w-full">
                        <div
                            className={cn(
                                'rounded-lg border p-4 shadow-md backdrop-blur-xl',
                                isDark
                                    ? 'border-white/10 bg-black/40'
                                    : 'border-slate-200 bg-white',
                            )}
                        >
                            <p
                                className={cn(
                                    'mb-2 flex items-center gap-2 text-sm font-medium',
                                    isDark ? 'text-white/90' : 'text-slate-900',
                                )}
                            >
                                <span
                                    className={cn(
                                        'inline-block h-2 w-2 animate-pulse rounded-full',
                                        isDark
                                            ? 'bg-green-400'
                                            : 'bg-emerald-500',
                                    )}
                                />
                                Recording Preview
                            </p>
                            <audio
                                controls
                                src={audioUrl}
                                className={cn(
                                    'w-full rounded-md border text-sm',
                                    isDark
                                        ? 'border-white/10 bg-black/30 text-white'
                                        : 'border-slate-200 bg-slate-50 text-slate-900',
                                )}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
