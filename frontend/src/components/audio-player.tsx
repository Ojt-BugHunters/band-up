'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AudioSection {
    id: string;
    title: string;
    audioUrl: string;
    duration: number;
    metadata?: string | null;
}

interface AudioPlayerProps {
    sections: AudioSection[];
    currentSection: string;
    onSectionChange: (sectionId: string) => void;
    isTestStarted: boolean;
    onTestStart: () => void;
}

export default function AudioPlayer({
    sections,
    currentSection,
    onSectionChange,
    isTestStarted,
    onTestStart,
}: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    const currentSectionData = sections.find((s) => s.id === currentSection);

    // Parse metadata to get HTML content
    const getHtmlContent = () => {
        if (!currentSectionData?.metadata) return null;

        try {
            const parsed = JSON.parse(currentSectionData.metadata);
            return parsed.htmlContent || null;
        } catch (error) {
            console.error('Failed to parse metadata:', error);
            return null;
        }
    };

    const htmlContent = getHtmlContent();

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => {
            setIsPlaying(false);
            const currentIndex = sections.findIndex(
                (s) => s.id === currentSection,
            );
            if (currentIndex < sections.length - 1) {
                onSectionChange(sections[currentIndex + 1].id);
            }
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [currentSection, sections, onSectionChange]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = isMuted ? 0 : volume;
    }, [volume, isMuted]);

    useEffect(() => {
        setCurrentTime(0);
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
    }, [currentSection]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (!hasStarted && !isTestStarted) {
            onTestStart();
            setHasStarted(true);
        }

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const restart = () => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.currentTime = 0;
        setCurrentTime(0);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercentage =
        duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="flex h-full flex-col gap-6 p-6">
            {/* Audio Player Card */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-balance">
                            Audio Player
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                            Section{' '}
                            {sections.findIndex(
                                (s) => s.id === currentSection,
                            ) + 1}{' '}
                            of {sections.length}
                        </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {sections.map((section, index) => (
                            <Button
                                key={section.id}
                                variant={
                                    currentSection === section.id
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() => onSectionChange(section.id)}
                                className="text-xs"
                            >
                                Section {index + 1}
                            </Button>
                        ))}
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {currentSectionData && (
                        <>
                            <audio
                                ref={audioRef}
                                src={currentSectionData.audioUrl}
                                preload="metadata"
                            />

                            <div className="space-y-3">
                                <h3 className="font-medium text-balance">
                                    {currentSectionData.title}
                                </h3>

                                <div className="space-y-2">
                                    <Progress
                                        value={progressPercentage}
                                        className="h-2"
                                    />
                                    <div className="text-muted-foreground flex justify-between text-xs">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={restart}
                                        disabled={!isTestStarted}
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        onClick={togglePlay}
                                        size="lg"
                                        className="h-12 w-12 rounded-full"
                                        disabled={!isTestStarted && !hasStarted}
                                    >
                                        {isPlaying ? (
                                            <Pause className="h-6 w-6" />
                                        ) : (
                                            <Play className="ml-1 h-6 w-6" />
                                        )}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={toggleMute}
                                        disabled={!isTestStarted}
                                    >
                                        {isMuted ? (
                                            <VolumeX className="h-4 w-4" />
                                        ) : (
                                            <Volume2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <VolumeX className="text-muted-foreground h-4 w-4" />
                                    <Progress
                                        value={isMuted ? 0 : volume * 100}
                                        className="h-2 flex-1 cursor-pointer"
                                        onClick={(e) => {
                                            const rect =
                                                e.currentTarget.getBoundingClientRect();
                                            const x = e.clientX - rect.left;
                                            const newVolume = x / rect.width;
                                            setVolume(
                                                Math.max(
                                                    0,
                                                    Math.min(1, newVolume),
                                                ),
                                            );
                                            setIsMuted(false);
                                        }}
                                    />
                                    <Volume2 className="text-muted-foreground h-4 w-4" />
                                </div>
                            </div>

                            {!isTestStarted && !hasStarted && (
                                <div className="bg-primary/10 border-primary/20 rounded-lg border p-3 text-center">
                                    <p className="text-primary text-sm">
                                        Click the play button to start the
                                        listening test. The audio will play
                                        automatically for each section.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* HTML Content Card */}
            {htmlContent && (
                <Card className="flex-1">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg text-balance">
                            Section Instructions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-80px)] p-0">
                        <ScrollArea className="h-full">
                            <div
                                className="prose prose-sm dark:prose-invert max-w-none p-6"
                                dangerouslySetInnerHTML={{
                                    __html: htmlContent,
                                }}
                            />
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
