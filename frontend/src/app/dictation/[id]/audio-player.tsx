import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Pause, Play, RotateCcw, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
    currentTime: number;
    setCurrentTime: (time: number) => void;
    isPlaying: boolean;
    setIsPlaying: (play: boolean) => void;
    volume: number;
    setVolume: (volumne: number) => void;
    playbackSpeed: number;
    setPlaybackSpeed: (speed: number) => void;
}

const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5];

export function AudioPlayer({
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    playbackSpeed,
    setPlaybackSpeed,
}: AudioPlayerProps) {
    return (
        <Card className="flex h-fit w-[380px] flex-col border-0 shadow-xl">
            <div className="border-b bg-gradient-to-r from-blue-100/80 to-indigo-100/60 p-5">
                <h2 className="flex items-center justify-center gap-2 text-lg font-semibold text-slate-800">
                    <Volume2 className="h-5 w-5 text-blue-600" />
                    Audio Player
                </h2>
                <p className="mt-1 text-center text-sm text-slate-600">
                    Listen carefully and write what you hear
                </p>
            </div>
            <div className="flex items-center justify-center bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-8">
                <div className="w-full space-y-6">
                    <div className="space-y-3">
                        <Slider
                            value={[currentTime]}
                            max={515}
                            step={1}
                            onValueChange={(value) => setCurrentTime(value[0])}
                            className="cursor-pointer"
                        />
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>
                                {Math.floor(currentTime / 60)}:
                                {(currentTime % 60).toString().padStart(2, '0')}
                            </span>
                            <span>8:35</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 py-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentTime(0)}
                            className="h-14 w-14 rounded-full border-slate-200 bg-white shadow-md transition-all hover:shadow-lg"
                        >
                            <RotateCcw className="h-5 w-5" />
                        </Button>
                        <Button
                            size="icon"
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 shadow-xl transition-all hover:from-blue-500 hover:to-indigo-600 hover:shadow-2xl"
                        >
                            {isPlaying ? (
                                <Pause className="h-8 w-8 text-white" />
                            ) : (
                                <Play className="ml-1 h-8 w-8 text-white" />
                            )}
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">
                                Playback Speed
                            </span>
                            <span className="text-sm text-slate-600">
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
                                    onClick={() => setPlaybackSpeed(speed)}
                                    className={cn(
                                        'flex-1 transition-all',
                                        playbackSpeed === speed
                                            ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-md hover:from-blue-500 hover:to-indigo-600'
                                            : 'border-slate-200 bg-white hover:bg-slate-50',
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
                                <Volume2 className="h-4 w-4 text-slate-600" />
                                <span className="text-sm font-medium text-slate-700">
                                    Volume
                                </span>
                            </div>
                            <span className="text-sm text-slate-600">
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
