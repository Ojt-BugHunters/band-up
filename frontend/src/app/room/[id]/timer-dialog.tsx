import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Clock, Timer, Zap } from 'lucide-react';
import { POMODORO_PRESETS } from './page.data';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { PomodoroPreset } from '@/lib/service/room';
import { TimerSettings } from './page';

interface TimerControlDialogProps {
    showTimerSettings: boolean;
    setShowTimerSettings: (open: boolean) => void;
    timerTab: 'focus' | 'stopwatch';
    setTimerTab: (tab: 'focus' | 'stopwatch') => void;
    selectedPreset: PomodoroPreset;
    setSelectedPreset: (p: PomodoroPreset) => void;
    countUpTimer: boolean;
    setCountUpTimer: (v: boolean) => void;
    deepFocus: boolean;
    setDeepFocus: (v: boolean) => void;
    customSettings: TimerSettings;
    setCustomSettings: (setting: TimerSettings) => void;
    isActive: boolean;
    applyTimerSettings: () => void;
    toggleTimer: () => void;
    resetTimer: () => void;
}

export function TimerControlDialog({
    showTimerSettings,
    setShowTimerSettings,
    timerTab,
    setTimerTab,
    selectedPreset,
    setSelectedPreset,
    countUpTimer,
    setCountUpTimer,
    deepFocus,
    setDeepFocus,
    customSettings,
    setCustomSettings,
    isActive,
    applyTimerSettings,
    toggleTimer,
    resetTimer,
}: TimerControlDialogProps) {
    return (
        <div className="flex items-center gap-3">
            <Dialog
                open={showTimerSettings}
                onOpenChange={setShowTimerSettings}
            >
                <button
                    onClick={() => setShowTimerSettings(true)}
                    className="group relative flex h-14 items-center justify-center rounded-2xl border border-zinc-700/50 bg-zinc-800/80 p-4 shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-700/80"
                >
                    <Timer className="h-5 w-5 text-white" />
                    <div className="absolute -top-12 left-1/2 hidden -translate-x-1/2 rounded-xl border border-zinc-700/50 bg-zinc-900/90 px-3 py-2 text-xs font-semibold whitespace-nowrap text-white shadow-xl shadow-black/30 backdrop-blur-md group-hover:block">
                        Toggle between Pomodoro or Stopwatch.
                    </div>
                </button>

                <DialogTitle></DialogTitle>
                <DialogContent className="border-zinc-700/50 bg-zinc-900/95 text-white shadow-2xl shadow-black/40 backdrop-blur-xl sm:max-w-md">
                    <DialogHeader>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setTimerTab('focus')}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 transition-colors ${
                                    timerTab === 'focus'
                                        ? 'border border-zinc-600/50 bg-zinc-700/80 backdrop-blur-md'
                                        : 'border border-zinc-700/30 bg-zinc-800/50 hover:bg-zinc-800/70'
                                }`}
                            >
                                <Timer className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    Focus Timer
                                </span>
                            </button>
                            <button
                                onClick={() => setTimerTab('stopwatch')}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 transition-colors ${
                                    timerTab === 'stopwatch'
                                        ? 'border border-zinc-600/50 bg-zinc-700/80 backdrop-blur-md'
                                        : 'border border-zinc-700/30 bg-zinc-800/50 hover:bg-zinc-800/70'
                                }`}
                            >
                                <Clock className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    Stopwatch
                                </span>
                            </button>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {timerTab === 'focus' && (
                            <>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-white/80">
                                        Preset:
                                    </span>
                                    <Select
                                        value={selectedPreset.name}
                                        onValueChange={(value) => {
                                            const preset =
                                                POMODORO_PRESETS.find(
                                                    (p) => p.name === value,
                                                );
                                            if (preset)
                                                setSelectedPreset(preset);
                                        }}
                                    >
                                        <SelectTrigger className="flex-1 border-zinc-700/50 bg-zinc-800/80 text-white backdrop-blur-md">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="border-zinc-700/50 bg-zinc-900/95 text-white backdrop-blur-xl">
                                            {POMODORO_PRESETS.map((preset) => (
                                                <SelectItem
                                                    key={preset.name}
                                                    value={preset.name}
                                                >
                                                    {preset.name === 'Custom'
                                                        ? 'Custom'
                                                        : `${preset.name} ${preset.focus}m - ${preset.shortBreak}m - ${preset.longBreak}m`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedPreset.name === 'Custom' && (
                                    <div className="space-y-3 rounded-lg border border-zinc-700/30 bg-zinc-800/50 p-4">
                                        <div className="flex items-center gap-3">
                                            <label className="w-28 text-sm text-white/80">
                                                Focus Time:
                                            </label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="120"
                                                value={customSettings.focus}
                                                onChange={(e) =>
                                                    setCustomSettings({
                                                        ...customSettings,
                                                        focus:
                                                            Number.parseInt(
                                                                e.target.value,
                                                            ) || 25,
                                                    })
                                                }
                                                className="flex-1 border-zinc-700/50 bg-zinc-800/80 text-white"
                                            />
                                            <span className="text-sm text-white/60">
                                                min
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <label className="w-28 text-sm text-white/80">
                                                Short Break:
                                            </label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="30"
                                                value={
                                                    customSettings.shortBreak
                                                }
                                                onChange={(e) =>
                                                    setCustomSettings({
                                                        ...customSettings,
                                                        shortBreak:
                                                            Number.parseInt(
                                                                e.target.value,
                                                            ) || 5,
                                                    })
                                                }
                                                className="flex-1 border-zinc-700/50 bg-zinc-800/80 text-white"
                                            />
                                            <span className="text-sm text-white/60">
                                                min
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <label className="w-28 text-sm text-white/80">
                                                Long Break:
                                            </label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="60"
                                                value={customSettings.longBreak}
                                                onChange={(e) =>
                                                    setCustomSettings({
                                                        ...customSettings,
                                                        longBreak:
                                                            Number.parseInt(
                                                                e.target.value,
                                                            ) || 15,
                                                    })
                                                }
                                                className="flex-1 border-zinc-700/50 bg-zinc-800/80 text-white"
                                            />
                                            <span className="text-sm text-white/60">
                                                min
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between rounded-lg border border-zinc-700/30 bg-zinc-800/50 p-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700/80">
                                            <Clock className="h-3 w-3" />
                                        </div>
                                        <span className="text-sm">
                                            Count up timer
                                        </span>
                                    </div>
                                    <Checkbox
                                        checked={countUpTimer}
                                        onCheckedChange={(checked) =>
                                            setCountUpTimer(checked as boolean)
                                        }
                                        className="border-zinc-600/50 data-[state=checked]:bg-white data-[state=checked]:text-black"
                                    />
                                </div>

                                <div className="rounded-lg border border-zinc-700/30 bg-zinc-800/50 p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700/80">
                                                <Zap className="h-3 w-3" />
                                            </div>
                                            <span className="text-sm">
                                                Deep Focus
                                            </span>
                                        </div>
                                        <Checkbox
                                            checked={deepFocus}
                                            onCheckedChange={(checked) =>
                                                setDeepFocus(checked as boolean)
                                            }
                                            className="border-zinc-600/50 data-[state=checked]:bg-white data-[state=checked]:text-black"
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-white/50">
                                        Requires studyfoc.us Chrome extension
                                    </p>
                                </div>
                            </>
                        )}

                        {timerTab === 'stopwatch' && (
                            <div className="py-4 text-center text-sm text-white/70">
                                Stopwatch mode will count up from 00:00
                            </div>
                        )}

                        <Button
                            onClick={applyTimerSettings}
                            className="w-full bg-white text-black hover:bg-white/90"
                        >
                            Apply Settings
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Button
                onClick={toggleTimer}
                size="lg"
                className="h-14 rounded-2xl bg-white px-12 text-lg font-bold text-black shadow-2xl shadow-black/30 transition-all hover:scale-105 hover:bg-white/90 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
            >
                {isActive ? 'Pause' : 'Start'}
            </Button>
            {isActive && (
                <Button
                    onClick={resetTimer}
                    variant="ghost"
                    className="font-semibold text-white hover:bg-zinc-800/50 hover:text-white"
                >
                    Reset
                </Button>
            )}
        </div>
    );
}
