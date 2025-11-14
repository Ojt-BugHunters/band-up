'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Pause, Play, RotateCcw, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
    audioUrl: string;
    currentTime: number;
    setCurrentTime: (time: number) => void;
    isPlaying: boolean;
    setIsPlaying: (play: boolean) => void;
    volume: number;
    setVolume: (volume: number) => void;
    playbackSpeed: number;
    setPlaybackSpeed: (speed: number) => void;
}

const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5];

export function AudioPlayer({
    audioUrl,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    playbackSpeed,
    setPlaybackSpeed,
}: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration || 0);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [setCurrentTime, setIsPlaying]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.play().catch(() => {
                setIsPlaying(false);
            });
        } else {
            audio.pause();
        }
    }, [isPlaying, setIsPlaying]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (Math.abs(audio.currentTime - currentTime) > 0.15) {
            audio.currentTime = currentTime;
        }
    }, [currentTime]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = volume / 100;
    }, [volume]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.playbackRate = playbackSpeed;
    }, [playbackSpeed]);

    const handleSeek = (value: number[]) => {
        const time = value[0];
        setCurrentTime(time);
    };

    const formatTime = (seconds: number) => {
        if (!seconds || Number.isNaN(seconds)) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60)
            .toString()
            .padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleReset = () => {
        setCurrentTime(0);
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.pause();
        }
    };

    return (
        <Card className="flex h-fit w-[380px] flex-col rounded-3xl border border-slate-100 bg-white/90 shadow-lg">
            <audio
                ref={audioRef}
                src={audioUrl}
                preload="metadata"
                className="hidden"
            />

            <div className="border-b bg-gradient-to-r from-indigo-50 to-blue-50 px-5 py-4">
                <h2 className="flex items-center justify-center gap-2 text-base font-semibold text-slate-800">
                    <Volume2 className="h-4 w-4 text-indigo-500" />
                    Audio Player
                </h2>
                <p className="mt-1 text-center text-xs text-slate-500">
                    Listen carefully and write what you hear
                </p>
            </div>

            <div className="flex items-center justify-center bg-slate-50/60 px-6 py-6">
                <div className="w-full space-y-6">
                    <div className="space-y-3">
                        <Slider
                            value={[Math.min(currentTime, duration || 0)]}
                            max={duration || 0}
                            step={0.1}
                            onValueChange={handleSeek}
                            className="cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    <div className="relative flex items-center justify-center py-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleReset}
                            className="absolute left-12 h-11 w-11 rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                        >
                            <RotateCcw className="h-5 w-5" />
                        </Button>

                        <Button
                            size="icon"
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500 text-white shadow-sm hover:bg-indigo-600"
                        >
                            {isPlaying ? (
                                <Pause className="h-7 w-7" />
                            ) : (
                                <Play className="h-7 w-7" />
                            )}
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-700">
                                Playback Speed
                            </span>
                            <span className="text-xs text-slate-500">
                                {playbackSpeed}x
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {playbackSpeeds.map((speed) => (
                                <Button
                                    key={speed}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPlaybackSpeed(speed)}
                                    className={cn(
                                        'flex-1 rounded-full text-xs font-medium transition-all',

                                        playbackSpeed === speed
                                            ? 'border-indigo-400 bg-indigo-100 text-indigo-700 shadow-sm hover:bg-indigo-200'
                                            : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100',
                                    )}
                                >
                                    {speed}x
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Volume2 className="h-4 w-4 text-slate-500" />
                                <span className="text-xs font-medium text-slate-700">
                                    Volume
                                </span>
                            </div>
                            <span className="text-xs text-slate-500">
                                {volume}%
                            </span>
                        </div>
                        <Slider
                            value={[volume]}
                            max={100}
                            step={1}
                            onValueChange={(value) => setVolume(value[0])}
                            className="cursor-pointer"
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
}
