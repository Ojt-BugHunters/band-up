'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Volume2, Send, Loader2 } from 'lucide-react';
import { DictationAudio } from '@/lib/api/dto/dictation';

type DictationContentProps = {
    selectedAudio: DictationAudio;
};

type FormValues = {
    transcription: string;
};

const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5];

export function DictationContent({ selectedAudio }: DictationContentProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [volume, setVolume] = useState(80);
    const audioRef = useRef<HTMLAudioElement>(null);

    const form = useForm<FormValues>({
        defaultValues: {
            transcription: '',
        },
    });

    // Submit mutation
    const submitMutation = useMutation({
        mutationFn: async (data: FormValues) => {
            // Replace with your actual API endpoint
            const response = await fetch('/api/dictation/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    audioId: selectedAudio.id,
                    transcription: data.transcription,
                }),
            });
            if (!response.ok) throw new Error('Failed to submit');
            return response.json();
        },
        onSuccess: () => {
            // Handle success (e.g., show toast, reset form)
            form.reset();
        },
    });

    const onSubmit = (data: FormValues) => {
        submitMutation.mutate(data);
    };

    // Audio controls
    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleRestart = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (value: number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value[0];
            setCurrentTime(value[0]);
        }
    };

    const handleVolumeChange = (value: number[]) => {
        const newVolume = value[0];
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume / 100;
        }
    };

    const handleSpeedChange = (speed: number) => {
        setPlaybackSpeed(speed);
        if (audioRef.current) {
            audioRef.current.playbackRate = speed;
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Reset when audio changes
    useEffect(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (audioRef.current) {
            audioRef.current.load();
        }
    }, [selectedAudio.id]);

    return (
        <div className="flex flex-1 flex-col">
            {/* Header */}
            <header className="border-border bg-card border-b px-8 py-6">
                <h2 className="text-card-foreground text-2xl font-semibold text-balance">
                    {selectedAudio.title}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                    Listen carefully and write what you hear
                </p>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="mx-auto max-w-4xl space-y-8 p-8">
                    {/* Audio Player Card */}
                    <Card className="space-y-6 p-8">
                        <div className="space-y-4">
                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <Slider
                                    value={[currentTime]}
                                    max={duration || 100}
                                    step={0.1}
                                    onValueChange={handleSeek}
                                    className="cursor-pointer"
                                />
                                <div className="text-muted-foreground flex justify-between text-xs">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            {/* Playback Controls */}
                            <div className="flex items-center justify-center gap-4">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleRestart}
                                    className="h-12 w-12 rounded-full bg-transparent"
                                >
                                    <RotateCcw className="h-5 w-5" />
                                </Button>
                                <Button
                                    size="icon"
                                    onClick={togglePlayPause}
                                    className="h-16 w-16 rounded-full"
                                >
                                    {isPlaying ? (
                                        <Pause className="h-6 w-6" />
                                    ) : (
                                        <Play className="ml-1 h-6 w-6" />
                                    )}
                                </Button>
                            </div>

                            {/* Speed Controls */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-foreground text-sm font-medium">
                                        Playback Speed
                                    </span>
                                    <span className="text-muted-foreground text-sm">
                                        {playbackSpeed}x
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {playbackSpeeds.map((speed) => (
                                        <Button
                                            key={speed}
                                            variant={
                                                playbackSpeed === speed
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            onClick={() =>
                                                handleSpeedChange(speed)
                                            }
                                            className="flex-1"
                                        >
                                            {speed}x
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Volume Control */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Volume2 className="text-muted-foreground h-4 w-4" />
                                        <span className="text-foreground text-sm font-medium">
                                            Volume
                                        </span>
                                    </div>
                                    <span className="text-muted-foreground text-sm">
                                        {volume}%
                                    </span>
                                </div>
                                <Slider
                                    value={[volume]}
                                    max={100}
                                    step={1}
                                    onValueChange={handleVolumeChange}
                                    className="cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Hidden Audio Element */}
                        <audio
                            ref={audioRef}
                            src={selectedAudio.url}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onEnded={() => setIsPlaying(false)}
                        />
                    </Card>

                    {/* Transcription Form */}
                    <Card className="p-8">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                <FormField
                                    control={form.control}
                                    name="transcription"
                                    rules={{
                                        required: 'Please write what you heard',
                                    }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">
                                                Your Transcription
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Type what you hear from the audio..."
                                                    className="min-h-[300px] resize-none text-base leading-relaxed"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            <p className="text-muted-foreground text-sm">
                                                Write down everything you hear.
                                                You can replay the audio as many
                                                times as needed.
                                            </p>
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-end gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => form.reset()}
                                        disabled={submitMutation.isPending}
                                    >
                                        Clear
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={submitMutation.isPending}
                                        className="min-w-32"
                                    >
                                        {submitMutation.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Submit
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
