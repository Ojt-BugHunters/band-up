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
import { Clock, Timer } from 'lucide-react';
import { POMODORO_PRESETS } from './page.data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PomodoroPreset, useCreateTimerSetting } from '@/lib/service/room';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

interface TimerControlDialogProps {
    roomId: string;
    showTimerSettings: boolean;
    setShowTimerSettings: (open: boolean) => void;
    timerTab: 'focus' | 'stopwatch';
    setTimerTab: (tab: 'focus' | 'stopwatch') => void;
    selectedPreset: PomodoroPreset;
    setSelectedPreset: (p: PomodoroPreset) => void;
    isActive: boolean;
    applyTimerSettings: () => void;
    toggleTimer: () => void;
    resetTimer: () => void;
}

export function TimerControlDialog({
    roomId,
    showTimerSettings,
    setShowTimerSettings,
    timerTab,
    setTimerTab,
    selectedPreset,
    setSelectedPreset,
    isActive,
    applyTimerSettings,
    toggleTimer,
    resetTimer,
}: TimerControlDialogProps) {
    const { form: createTimerForm, mutation: createTimerMutation } =
        useCreateTimerSetting(roomId);
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
                                                        : `${preset.name} ${preset.focus}m - ${preset.shortBreak}m - ${preset.longBreak}m - ${preset.cycle} sessions`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedPreset.name === 'Custom' && (
                                    <Form {...createTimerForm}>
                                        <form className="space-y-3 rounded-lg border border-zinc-700/30 bg-zinc-800/50 p-4">
                                            <FormField
                                                control={
                                                    createTimerForm.control
                                                }
                                                name="focusTime"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <div className="flex items-center gap-3">
                                                            <FormLabel className="w-28 text-sm text-white/80">
                                                                Focus Time:
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    min={1}
                                                                    max={120}
                                                                    className="flex-1 border-zinc-700/50 bg-zinc-800/80 text-white"
                                                                    value={
                                                                        field.value ??
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        field.onChange(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </FormControl>
                                                            <span className="text-sm text-white/60">
                                                                min
                                                            </span>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={
                                                    createTimerForm.control
                                                }
                                                name="shortBreak"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <div className="flex items-center gap-3">
                                                            <FormLabel className="w-28 text-sm text-white/80">
                                                                Short Break:
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    min={1}
                                                                    max={30}
                                                                    className="flex-1 border-zinc-700/50 bg-zinc-800/80 text-white"
                                                                    value={
                                                                        field.value ??
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        field.onChange(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </FormControl>
                                                            <span className="text-sm text-white/60">
                                                                min
                                                            </span>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={
                                                    createTimerForm.control
                                                }
                                                name="longBreak"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <div className="flex items-center gap-3">
                                                            <FormLabel className="w-28 text-sm text-white/80">
                                                                Long Break:
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    min={1}
                                                                    max={60}
                                                                    className="flex-1 border-zinc-700/50 bg-zinc-800/80 text-white"
                                                                    value={
                                                                        field.value ??
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        field.onChange(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </FormControl>
                                                            <span className="text-sm text-white/60">
                                                                min
                                                            </span>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={
                                                    createTimerForm.control
                                                }
                                                name="cycles"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <div className="flex items-center gap-3">
                                                            <FormLabel className="w-28 text-sm text-white/80">
                                                                Cycle:
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    min={1}
                                                                    max={10}
                                                                    className="flex-1 border-zinc-700/50 bg-zinc-800/80 text-white"
                                                                    value={
                                                                        field.value ??
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        field.onChange(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </FormControl>
                                                            <span className="text-sm text-white/60">
                                                                times
                                                            </span>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </form>
                                    </Form>
                                )}
                            </>
                        )}{' '}
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
