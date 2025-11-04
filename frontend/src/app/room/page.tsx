'use client';

import type React from 'react';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    Clock,
    BarChart3,
    Video,
    Grid3x3,
    Zap,
    Settings,
    ListTodo,
    X,
    GripVertical,
    MessageSquare,
    Send,
    Mic,
    MicOff,
    VideoOff,
    Users,
    Phone,
    ChevronLeft,
    ChevronRight,
    Info,
    Globe,
    TrendingUp,
    TrendingDown,
    Flame,
    CheckCircle2,
    Atom,
    MonitorPlay,
    PhoneOff,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import {
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
    ResponsiveContainer,
} from 'recharts';
import { Task, AmbientSound } from '@/lib/api/dto/room';
import {
    BACKGROUND_IMAGES,
    POMODORO_PRESETS,
    AMBIENT_SOUNDS,
} from './page.data';
import {
    mockLeaderboardData,
    mockAnalyticsData,
    mockStats,
} from '../../../constants/sample-data';
import { TimerControlDialog } from './timer-dialog';
import { MusicMixer } from './music-mixer';
import { PlayMusicWithLink } from './music-add-link';
import { BackgroundImage } from './background-image';
import { ToDoListBox } from './to-do-list';

interface FlyingTask {
    id: string;
    text: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

export interface TimerSettings {
    focus: number;
    shortBreak: number;
    longBreak: number;
}

type TimePeriod = 'daily' | 'weekly' | 'monthly';

type DisplayMode = 'pomodoro' | 'ai-chat' | 'room' | 'collaboration';

export default function RoomPage() {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isPomodoroMode, setIsPomodoroMode] = useState(true); // consider pomodoro mode or timelapse mode
    const [task, setTask] = useState('');
    const [backgroundImage, setBackgroundImage] = useState('');
    const [taskList, setTaskList] = useState<Task[]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [flyingTask, setFlyingTask] = useState<FlyingTask | null>(null); // consider the task apply fling animation (todolist task)
    const [showTimerSettings, setShowTimerSettings] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState(POMODORO_PRESETS[0]);
    const [countUpTimer, setCountUpTimer] = useState(false);
    const [deepFocus, setDeepFocus] = useState(false);
    const [timerTab, setTimerTab] = useState<'focus' | 'stopwatch'>('focus');

    const [customSettings, setCustomSettings] = useState<TimerSettings>({
        focus: 25,
        shortBreak: 5,
        longBreak: 15,
    });
    const [pomodoroSession, setPomodoroSession] = useState(0);
    const [sessionType, setSessionType] = useState<
        'focus' | 'shortBreak' | 'longBreak'
    >('focus');

    const [ambientSounds, setAmbientSounds] =
        useState<AmbientSound[]>(AMBIENT_SOUNDS);
    const [showAmbientMixer, setShowAmbientMixer] = useState(false);

    const [showMusicDialog, setShowMusicDialog] = useState(false);
    const [musicLink, setMusicLink] = useState('');
    const [savedMusicLinks, setSavedMusicLinks] = useState<string[]>([]);

    const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
    const [customBackgroundImage, setCustomBackgroundImage] = useState<
        string | null
    >(null);

    const [displayMode, setDisplayMode] = useState<DisplayMode>('pomodoro'); // Fixed: declare setDisplayMode

    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [leaderboardPeriod, setLeaderboardPeriod] =
        useState<TimePeriod>('daily');
    const [leaderboardDate, setLeaderboardDate] = useState(new Date());

    const [showAnalytics, setShowAnalytics] = useState(false);
    const [analyticsPeriod, setAnalyticsPeriod] = useState<
        'today' | 'week' | 'month'
    >('today');
    const [analyticsDate, setAnalyticsDate] = useState(new Date());

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLDivElement>(null);
    const taskButtonRef = useRef<HTMLButtonElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const randomImage =
            BACKGROUND_IMAGES[
                Math.floor(Math.random() * BACKGROUND_IMAGES.length)
            ];
        setBackgroundImage(randomImage);
    }, []);

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                if (isPomodoroMode) {
                    // Countdown mode for Pomodoro
                    if (seconds === 0) {
                        if (minutes === 0) {
                            // Timer completed
                            setIsActive(false);
                            handlePomodoroComplete();
                        } else {
                            setMinutes(minutes - 1);
                            setSeconds(59);
                        }
                    } else {
                        setSeconds(seconds - 1);
                    }
                } else {
                    // Count up mode for Stopwatch
                    if (seconds === 59) {
                        setMinutes(minutes + 1);
                        setSeconds(0);
                    } else {
                        setSeconds(seconds + 1);
                    }
                }
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive, minutes, seconds, isPomodoroMode]);

    const handlePomodoroComplete = () => {
        if (!isPomodoroMode) return;

        const settings =
            selectedPreset.name === 'Custom' ? customSettings : selectedPreset;

        if (sessionType === 'focus') {
            // After focus, go to break
            if (pomodoroSession === 3) {
                // After 4th focus session, take long break
                setSessionType('longBreak');
                setMinutes(settings.longBreak);
                setSeconds(0);
                setPomodoroSession(0);
                toast.success('Time for long break');
            } else {
                // Take short break
                setSessionType('shortBreak');
                setMinutes(settings.shortBreak);
                setSeconds(0);
                toast.success('Time for short break');
            }
        } else {
            // After break, go back to focus
            setSessionType('focus');
            setMinutes(settings.focus);
            setSeconds(0);
            if (sessionType === 'shortBreak') {
                setPomodoroSession(pomodoroSession + 1);
            }
            toast.success('Break is over');
        }
    };

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        if (isPomodoroMode) {
            const settings =
                selectedPreset.name === 'Custom'
                    ? customSettings
                    : selectedPreset;
            setMinutes(settings.focus);
            setSeconds(0);
            setSessionType('focus');
            setPomodoroSession(0);
        } else {
            setMinutes(0);
            setSeconds(0);
        }
    };

    const applyTimerSettings = () => {
        setIsPomodoroMode(timerTab === 'focus');
        setIsActive(false);
        if (timerTab === 'focus') {
            const settings =
                selectedPreset.name === 'Custom'
                    ? customSettings
                    : selectedPreset;
            setMinutes(settings.focus);
            setSeconds(0);
            setSessionType('focus');
            setPomodoroSession(0);
        } else {
            setMinutes(0);
            setSeconds(0);
        }
        setShowTimerSettings(false);
    };

    const handleTaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && task.trim()) {
            const inputRect = inputRef.current?.getBoundingClientRect();
            const buttonRect = taskButtonRef.current?.getBoundingClientRect();

            if (inputRect && buttonRect) {
                setFlyingTask({
                    id: Date.now().toString(),
                    text: task.trim(),
                    startX: inputRect.left + inputRect.width / 2,
                    startY: inputRect.top + inputRect.height / 2,
                    endX: buttonRect.left + buttonRect.width / 2,
                    endY: buttonRect.top + buttonRect.height / 2,
                });

                setTimeout(() => {
                    const newTask: Task = {
                        id: Date.now().toString(),
                        text: task.trim(),
                        completed: false,
                    };
                    setTaskList([...taskList, newTask]);

                    toast.success('Task added to your list');
                    setFlyingTask(null);
                }, 600);
            }

            setTask('');
        }
    };

    const toggleTaskCompletion = (id: string) => {
        setTaskList(
            taskList.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task,
            ),
        );
    };

    const removeTask = (id: string) => {
        setTaskList(taskList.filter((task) => task.id !== id));
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newTaskList = [...taskList];
        const draggedTask = newTaskList[draggedIndex];
        newTaskList.splice(draggedIndex, 1);
        newTaskList.splice(index, 0, draggedTask);

        setTaskList(newTaskList);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const toggleAmbientSound = (id: string) => {
        setAmbientSounds(
            ambientSounds.map((sound) =>
                sound.id === id ? { ...sound, enabled: !sound.enabled } : sound,
            ),
        );
    };

    const handleMusicLinkSubmit = () => {
        if (musicLink.trim()) {
            setSavedMusicLinks([...savedMusicLinks, musicLink.trim()]);
            toast.success('Music Link added');
            setMusicLink('');
        }
    };

    const removeMusicLink = (index: number) => {
        setSavedMusicLinks(savedMusicLinks.filter((_, i) => i !== index));
    };

    const selectBackgroundImage = (image: string) => {
        setBackgroundImage(image);
        setCustomBackgroundImage(null);
        toast.success('Background updated');
    };

    const handleCustomImageUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const imageUrl = event.target?.result as string;
                    setBackgroundImage(imageUrl);
                    setCustomBackgroundImage(imageUrl);
                    toast.success('Custom background updated');
                };
                reader.readAsDataURL(file);
            } else {
                toast.error('Please select the valid image type');
            }
        }
    };

    const formatLeaderboardDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const navigateLeaderboardDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(leaderboardDate);
        if (leaderboardPeriod === 'daily') {
            newDate.setDate(
                newDate.getDate() + (direction === 'next' ? 1 : -1),
            );
        } else if (leaderboardPeriod === 'weekly') {
            newDate.setDate(
                newDate.getDate() + (direction === 'next' ? 7 : -7),
            );
        } else {
            newDate.setMonth(
                newDate.getMonth() + (direction === 'next' ? 1 : -1),
            );
        }
        setLeaderboardDate(newDate);
    };

    const formatAnalyticsDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
        });
    };

    const navigateAnalyticsDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(analyticsDate);
        if (analyticsPeriod === 'today') {
            newDate.setDate(
                newDate.getDate() + (direction === 'next' ? 1 : -1),
            );
        } else if (analyticsPeriod === 'week') {
            newDate.setDate(
                newDate.getDate() + (direction === 'next' ? 7 : -7),
            );
        } else {
            newDate.setMonth(
                newDate.getMonth() + (direction === 'next' ? 1 : -1),
            );
        }
        setAnalyticsDate(newDate);
    };

    return (
        <div className="relative h-screen w-full overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 via-blue-500/10 to-slate-900/40" />
            </div>

            <AnimatePresence>
                {flyingTask && (
                    <motion.div
                        initial={{
                            position: 'fixed',
                            left: flyingTask.startX,
                            top: flyingTask.startY,
                            x: '-50%',
                            y: '-50%',
                            opacity: 1,
                            scale: 1,
                        }}
                        animate={{
                            left: flyingTask.endX,
                            top: flyingTask.endY,
                            opacity: 0,
                            scale: 0.5,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 0.6,
                            ease: [0.4, 0, 0.2, 1],
                        }}
                        className="pointer-events-none z-50 rounded-full border border-zinc-700/50 bg-zinc-800/90 px-4 py-2 backdrop-blur-xl"
                    >
                        <span className="text-sm font-medium text-white">
                            {flyingTask.text}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative z-10 h-full overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                    {displayMode === 'pomodoro' && (
                        <motion.div
                            key="pomodoro"
                            initial={{ x: '-100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '-100%', opacity: 0 }}
                            transition={{
                                duration: 0.5,
                                ease: [0.4, 0, 0.2, 1],
                            }}
                            className="absolute inset-0"
                        >
                            <PomodoroDisplay
                                minutes={minutes}
                                seconds={seconds}
                                isActive={isActive}
                                isPomodoroMode={isPomodoroMode}
                                task={task}
                                setTask={setTask}
                                taskList={taskList}
                                pomodoroSession={pomodoroSession}
                                sessionType={sessionType}
                                toggleTimer={toggleTimer}
                                resetTimer={resetTimer}
                                handleTaskKeyDown={handleTaskKeyDown}
                                inputRef={inputRef}
                                taskButtonRef={taskButtonRef}
                                showTimerSettings={showTimerSettings}
                                setShowTimerSettings={setShowTimerSettings}
                                timerTab={timerTab}
                                setTimerTab={setTimerTab}
                                selectedPreset={selectedPreset}
                                setSelectedPreset={setSelectedPreset}
                                customSettings={customSettings}
                                setCustomSettings={setCustomSettings}
                                countUpTimer={countUpTimer}
                                setCountUpTimer={setCountUpTimer}
                                deepFocus={deepFocus}
                                setDeepFocus={setDeepFocus}
                                applyTimerSettings={applyTimerSettings}
                                toggleTaskCompletion={toggleTaskCompletion}
                                removeTask={removeTask}
                                handleDragStart={handleDragStart}
                                handleDragOver={handleDragOver}
                                handleDragEnd={handleDragEnd}
                                draggedIndex={draggedIndex}
                                showAmbientMixer={showAmbientMixer}
                                setShowAmbientMixer={setShowAmbientMixer}
                                ambientSounds={ambientSounds}
                                setAmbientSounds={setAmbientSounds}
                                toggleAmbientSound={toggleAmbientSound}
                                showMusicDialog={showMusicDialog}
                                setShowMusicDialog={setShowMusicDialog}
                                musicLink={musicLink}
                                setMusicLink={setMusicLink}
                                savedMusicLinks={savedMusicLinks}
                                handleMusicLinkSubmit={handleMusicLinkSubmit}
                                removeMusicLink={removeMusicLink}
                                showBackgroundSelector={showBackgroundSelector}
                                setShowBackgroundSelector={
                                    setShowBackgroundSelector
                                }
                                selectBackgroundImage={selectBackgroundImage}
                                handleCustomImageUpload={
                                    handleCustomImageUpload
                                }
                                customBackgroundImage={customBackgroundImage}
                                fileInputRef={fileInputRef}
                                backgroundImage={backgroundImage}
                                showLeaderboard={showLeaderboard}
                                setShowLeaderboard={setShowLeaderboard}
                                leaderboardPeriod={leaderboardPeriod}
                                setLeaderboardPeriod={setLeaderboardPeriod}
                                leaderboardDate={leaderboardDate}
                                formatLeaderboardDate={formatLeaderboardDate}
                                navigateLeaderboardDate={
                                    navigateLeaderboardDate
                                }
                                mockLeaderboardData={mockLeaderboardData}
                                showAnalytics={showAnalytics}
                                setShowAnalytics={setShowAnalytics}
                                analyticsPeriod={analyticsPeriod}
                                setAnalyticsPeriod={setAnalyticsPeriod}
                                analyticsDate={analyticsDate}
                                formatAnalyticsDate={formatAnalyticsDate}
                                navigateAnalyticsDate={navigateAnalyticsDate}
                                mockAnalyticsData={mockAnalyticsData}
                                mockStats={mockStats}
                            />
                        </motion.div>
                    )}

                    {displayMode === 'ai-chat' && (
                        <motion.div
                            key="ai-chat"
                            initial={{
                                x:
                                    displayMode === 'pomodoro'
                                        ? '100%'
                                        : '-100%',
                                opacity: 0,
                            }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{
                                x: displayMode === 'room' ? '-100%' : '100%',
                                opacity: 0,
                            }}
                            transition={{
                                duration: 0.5,
                                ease: [0.4, 0, 0.2, 1],
                            }}
                            className="absolute inset-0"
                        >
                            <AIChatDisplay />
                        </motion.div>
                    )}

                    {displayMode === 'room' && (
                        <motion.div
                            key="room"
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{
                                duration: 0.5,
                                ease: [0.4, 0, 0.2, 1],
                            }}
                            className="absolute inset-0"
                        >
                            <RoomDisplay />
                        </motion.div>
                    )}

                    {displayMode === 'collaboration' && (
                        <motion.div
                            key="collaboration"
                            initial={{ x: '-100%', opacity: 0 }} // Adjusted initial to match other exits
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '-100%', opacity: 0 }} // Adjusted exit to match other exits
                            transition={{
                                duration: 0.5,
                                ease: [0.4, 0, 0.2, 1],
                            }}
                            className="absolute inset-0"
                        >
                            <CollaborationDisplay />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute right-6 bottom-6 z-20 flex items-center gap-2 rounded-2xl border border-zinc-700/50 bg-zinc-800/80 p-2 shadow-xl shadow-black/20 backdrop-blur-md">
                    <button
                        onClick={() => setDisplayMode('room')}
                        className={`rounded-xl p-3 transition-all hover:scale-105 ${
                            displayMode === 'room'
                                ? 'bg-rose-400 shadow-lg shadow-rose-400/50'
                                : 'bg-zinc-700/50 hover:bg-zinc-600/50'
                        }`}
                    >
                        <MessageSquare className="h-5 w-5 text-white" />
                    </button>
                    <button
                        onClick={() => setDisplayMode('ai-chat')}
                        className={`rounded-xl p-3 transition-all hover:scale-105 ${
                            displayMode === 'ai-chat'
                                ? 'bg-rose-400 shadow-lg shadow-rose-400/50'
                                : 'bg-zinc-700/50 hover:bg-zinc-600/50'
                        }`}
                    >
                        <Zap className="h-5 w-5 text-white" />
                    </button>
                    <button
                        onClick={() => setDisplayMode('collaboration')}
                        className={`rounded-xl p-3 transition-all hover:scale-105 ${
                            displayMode === 'collaboration'
                                ? 'bg-rose-400 shadow-lg shadow-rose-400/50'
                                : 'bg-zinc-700/50 hover:bg-zinc-600/50'
                        }`}
                    >
                        <MonitorPlay className="h-5 w-5 text-white" />
                    </button>
                    <button
                        onClick={() => setDisplayMode('pomodoro')}
                        className={`rounded-xl p-3 transition-all hover:scale-105 ${
                            displayMode === 'pomodoro'
                                ? 'bg-rose-400 shadow-lg shadow-rose-400/50'
                                : 'bg-zinc-700/50 hover:bg-zinc-600/50'
                        }`}
                    >
                        <Clock className="h-5 w-5 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function PomodoroDisplay({
    minutes,
    seconds,
    isActive,
    isPomodoroMode,
    task,
    setTask,
    taskList,
    pomodoroSession,
    sessionType,
    toggleTimer,
    resetTimer,
    handleTaskKeyDown,
    inputRef,
    taskButtonRef,
    showTimerSettings,
    setShowTimerSettings,
    timerTab,
    setTimerTab,
    selectedPreset,
    setSelectedPreset,
    customSettings,
    setCustomSettings,
    countUpTimer,
    setCountUpTimer,
    deepFocus,
    setDeepFocus,
    applyTimerSettings,
    toggleTaskCompletion,
    removeTask,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    draggedIndex,
    showAmbientMixer,
    setShowAmbientMixer,
    ambientSounds,
    setAmbientSounds,
    toggleAmbientSound,
    showMusicDialog,
    setShowMusicDialog,
    musicLink,
    setMusicLink,
    savedMusicLinks,
    handleMusicLinkSubmit,
    removeMusicLink,
    showBackgroundSelector,
    setShowBackgroundSelector,
    selectBackgroundImage,
    handleCustomImageUpload,
    customBackgroundImage,
    fileInputRef,
    backgroundImage,
    showLeaderboard,
    setShowLeaderboard,
    leaderboardPeriod,
    setLeaderboardPeriod,
    leaderboardDate,
    formatLeaderboardDate,
    navigateLeaderboardDate,
    mockLeaderboardData,
    showAnalytics,
    setShowAnalytics,
    analyticsPeriod,
    setAnalyticsPeriod,
    analyticsDate,
    formatAnalyticsDate,
    navigateAnalyticsDate,
    mockAnalyticsData,
    mockStats,
}: any) {
    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center justify-between p-6">
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700/50 bg-zinc-800/80 shadow-lg shadow-black/20 backdrop-blur-md">
                        <Clock className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-white drop-shadow-lg">
                        BandUp IELTS
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowAnalytics(true)}
                        className="flex items-center gap-2 rounded-full border border-zinc-700/50 bg-zinc-800/80 px-4 py-2 shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-700/80"
                    >
                        <Clock className="h-4 w-4 text-white" />
                        <span className="text-sm font-bold text-white">0m</span>
                    </button>
                    <button
                        onClick={() => setShowLeaderboard(true)}
                        className="rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-2 shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-700/80"
                    >
                        <BarChart3 className="h-5 w-5 text-white" />
                    </button>
                    <div className="flex items-center gap-2 rounded-full border border-zinc-700/50 bg-zinc-800/80 px-4 py-2 shadow-lg shadow-black/20 backdrop-blur-md">
                        <span className="text-sm font-bold text-white">
                            Nam Dang room
                        </span>
                    </div>
                    <Avatar className="h-10 w-10 border-2 border-zinc-700/50 shadow-lg shadow-black/20">
                        <AvatarFallback className="bg-zinc-800/80 font-bold text-white backdrop-blur-md">
                            ND
                        </AvatarFallback>
                    </Avatar>
                </div>
            </header>

            <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
                {isPomodoroMode && sessionType === 'focus' && (
                    <div className="flex gap-3">
                        {[0, 1, 2, 3].map((index) => (
                            <div
                                key={index}
                                className={`h-4 w-4 rounded-full transition-all ${
                                    index <= pomodoroSession
                                        ? 'bg-white shadow-xl shadow-white/50'
                                        : 'bg-white/30 shadow-md shadow-black/10 backdrop-blur-md'
                                }`}
                            />
                        ))}
                    </div>
                )}

                <div className="text-center">
                    <div className="text-[120px] leading-none font-extrabold text-white drop-shadow-2xl md:text-[180px]">
                        {String(minutes).padStart(2, '0')}:
                        {String(seconds).padStart(2, '0')}
                    </div>
                </div>

                <div
                    ref={inputRef}
                    className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-zinc-700/50 bg-zinc-800/80 px-4 py-3 shadow-xl shadow-black/20 backdrop-blur-md"
                >
                    <Grid3x3 className="h-5 w-5 text-white/70" />
                    <Input
                        type="text"
                        placeholder="What are you working on?"
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                        onKeyDown={handleTaskKeyDown}
                        className="border-0 bg-transparent font-medium text-white placeholder:text-white/70 focus-visible:ring-0"
                    />
                </div>

                {taskList.length > 0 && !taskList[0].completed && (
                    <div className="flex items-center gap-2 rounded-2xl border border-zinc-700/50 bg-zinc-800/80 px-6 py-3 shadow-lg shadow-black/20 backdrop-blur-md">
                        <ListTodo className="h-4 w-4 text-white/70" />
                        <span className="text-sm font-semibold text-white">
                            {taskList[0].text}
                        </span>
                    </div>
                )}

                <TimerControlDialog
                    showTimerSettings={showTimerSettings}
                    setShowTimerSettings={setShowTimerSettings}
                    selectedPreset={selectedPreset}
                    setSelectedPreset={setSelectedPreset}
                    timerTab={timerTab}
                    setTimerTab={setTimerTab}
                    countUpTimer={countUpTimer}
                    setCountUpTimer={setCountUpTimer}
                    deepFocus={deepFocus}
                    setDeepFocus={setDeepFocus}
                    customSettings={customSettings}
                    setCustomSettings={setCustomSettings}
                    applyTimerSettings={applyTimerSettings}
                    toggleTimer={toggleTimer}
                    isActive={isActive}
                    resetTimer={resetTimer}
                />
            </main>

            <footer className="flex items-center justify-between p-6">
                <div className="flex items-center gap-2">
                    <MusicMixer
                        showAmbientMixer={showAmbientMixer}
                        setShowAmbientMixer={setShowAmbientMixer}
                        ambientSounds={ambientSounds}
                        setAmbientSounds={setAmbientSounds}
                        toggleAmbientSound={toggleAmbientSound}
                    />
                    <PlayMusicWithLink
                        showMusicDialog={showMusicDialog}
                        setShowMusicDialog={setShowMusicDialog}
                        musicLink={musicLink}
                        setMusicLink={setMusicLink}
                        savedMusicLinks={savedMusicLinks}
                        handleMusicLinkSubmit={handleMusicLinkSubmit}
                        removeMusicLink={removeMusicLink}
                    />
                    <BackgroundImage
                        ref={fileInputRef}
                        showBackgroundSelector={showBackgroundSelector}
                        setShowBackgroundSelector={setShowBackgroundSelector}
                        selectBackgroundImage={selectBackgroundImage}
                        backgroundImage={backgroundImage}
                        customBackgroundImage={customBackgroundImage}
                        handleCustomImageUpload={handleCustomImageUpload}
                    />
                    <ToDoListBox
                        ref={taskButtonRef}
                        taskList={taskList}
                        draggedIndex={null}
                        handleDragStart={handleDragStart}
                        handleDragOver={handleDragOver}
                        handleDragEnd={handleDragEnd}
                        toggleTaskCompletion={toggleTaskCompletion}
                        removeTask={removeTask}
                    />
                </div>
            </footer>

            <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
                <DialogContent className="border-zinc-700/50 bg-zinc-900/95 p-0 text-white shadow-2xl shadow-black/40 backdrop-blur-xl sm:max-w-2xl [&>button]:hidden">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="flex max-h-[85vh] flex-col"
                    >
                        <div className="border-b border-zinc-700/50 bg-zinc-900/50 p-6 backdrop-blur-md">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 border-b-2 border-white pb-2">
                                        <Globe className="h-5 w-5" />
                                        <span className="text-lg font-semibold">
                                            Global
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-2.5 shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-700/80">
                                        <Info className="h-4 w-4 text-white/70" />
                                    </button>
                                    <button
                                        onClick={() =>
                                            setLeaderboardPeriod('daily')
                                        }
                                        className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                            leaderboardPeriod === 'daily'
                                                ? 'scale-105 bg-white text-black shadow-xl shadow-white/20'
                                                : 'border border-zinc-700/50 bg-zinc-800/80 text-white/80 shadow-lg shadow-black/20 hover:scale-105 hover:bg-zinc-700/80 hover:text-white'
                                        }`}
                                    >
                                        Daily
                                    </button>
                                    <button
                                        onClick={() =>
                                            setLeaderboardPeriod('weekly')
                                        }
                                        className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                            leaderboardPeriod === 'weekly'
                                                ? 'scale-105 bg-white text-black shadow-xl shadow-white/20'
                                                : 'border border-zinc-700/50 bg-zinc-800/80 text-white/80 shadow-lg shadow-black/20 hover:scale-105 hover:bg-zinc-700/80 hover:text-white'
                                        }`}
                                    >
                                        Weekly
                                    </button>
                                    <button
                                        onClick={() =>
                                            setLeaderboardPeriod('monthly')
                                        }
                                        className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                            leaderboardPeriod === 'monthly'
                                                ? 'scale-105 bg-white text-black shadow-xl shadow-white/20'
                                                : 'border border-zinc-700/50 bg-zinc-800/80 text-white/80 shadow-lg shadow-black/20 hover:scale-105 hover:bg-zinc-700/80 hover:text-white'
                                        }`}
                                    >
                                        Monthly
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-4">
                                <button
                                    onClick={() =>
                                        navigateLeaderboardDate('prev')
                                    }
                                    className="rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-2.5 shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:scale-110 hover:bg-zinc-700/80"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <span className="min-w-[140px] text-center text-base font-medium">
                                    {formatLeaderboardDate(leaderboardDate)}
                                </span>
                                <button
                                    onClick={() =>
                                        navigateLeaderboardDate('next')
                                    }
                                    className="rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-2.5 shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:scale-110 hover:bg-zinc-700/80"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="relative flex-1 overflow-hidden">
                            {/* Top scroll shadow */}
                            <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-8 bg-gradient-to-b from-zinc-900/95 to-transparent" />

                            <div
                                className="h-[500px] overflow-y-auto scroll-smooth px-6 py-4"
                                style={{
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: '#52525b #181818',
                                }}
                            >
                                <div className="space-y-2">
                                    <div className="sticky top-0 z-10 grid grid-cols-[60px_1fr_100px_40px] gap-4 border-b border-zinc-800/50 bg-zinc-900/95 px-4 py-3 text-xs font-semibold tracking-wider text-white/60 uppercase backdrop-blur-md">
                                        <span>#</span>
                                        <span>User</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Time
                                        </span>
                                        <span></span>
                                    </div>

                                    {mockLeaderboardData.map((user, index) => (
                                        <motion.div
                                            key={user.rank}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                delay: index * 0.03,
                                                duration: 0.3,
                                            }}
                                            className="grid cursor-pointer grid-cols-[60px_1fr_100px_40px] items-center gap-4 rounded-xl border border-zinc-700/40 bg-zinc-800/60 px-4 py-4 shadow-lg shadow-black/10 backdrop-blur-md transition-all hover:scale-[1.02] hover:border-zinc-600/60 hover:bg-zinc-800/80 hover:shadow-xl hover:shadow-black/20"
                                        >
                                            <div className="flex items-center gap-2">
                                                {user.rankChange === 'up' && (
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
                                                        <TrendingUp className="h-3 w-3 text-green-400" />
                                                    </div>
                                                )}
                                                {user.rankChange === 'down' && (
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20">
                                                        <TrendingDown className="h-3 w-3 text-red-400" />
                                                    </div>
                                                )}
                                                <span
                                                    className={`text-sm font-bold ${user.rank <= 3 ? 'text-yellow-400' : 'text-white'}`}
                                                >
                                                    {user.rank}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border-2 border-zinc-700/50 shadow-md shadow-black/20">
                                                    <AvatarFallback className="bg-zinc-700/80 text-xs font-semibold text-white">
                                                        {user.avatar}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex min-w-0 flex-col">
                                                    <div className="flex items-center gap-2">
                                                        {user.country && (
                                                            <span className="text-base">
                                                                {user.country}
                                                            </span>
                                                        )}
                                                        <span className="truncate text-sm font-medium text-white">
                                                            {user.username}
                                                        </span>
                                                    </div>
                                                    {user.status && (
                                                        <span className="truncate text-xs text-white/50">
                                                            {user.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <span className="text-sm font-semibold text-white">
                                                {user.studyTime}
                                            </span>

                                            <div className="flex items-center justify-center">
                                                <div className="rounded-lg border border-zinc-600/30 bg-zinc-700/50 p-1.5 backdrop-blur-sm">
                                                    <Globe className="h-4 w-4 text-white/70" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Bottom scroll shadow */}
                            <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-8 bg-gradient-to-t from-zinc-900/95 to-transparent" />
                        </div>
                    </motion.div>
                </DialogContent>
            </Dialog>

            <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
                <DialogContent className="border-zinc-700/50 bg-zinc-900/95 p-0 text-white shadow-2xl shadow-black/40 backdrop-blur-xl sm:max-w-4xl [&>button]:hidden">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="flex max-h-[85vh] flex-col"
                    >
                        <div className="flex-shrink-0 border-b border-zinc-700/50 bg-zinc-900/50 p-6 backdrop-blur-md">
                            <h2 className="mb-6 text-2xl font-bold">
                                Activities summary
                            </h2>

                            <Tabs defaultValue="analytics" className="w-full">
                                <TabsList className="mb-6 grid w-full grid-cols-2 border border-zinc-700/30 bg-zinc-800/50">
                                    <TabsTrigger
                                        value="analytics"
                                        className="font-semibold data-[state=active]:bg-zinc-700/80 data-[state=active]:text-white"
                                    >
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        Analytics
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="sessions"
                                        className="font-semibold data-[state=active]:bg-zinc-700/80 data-[state=active]:text-white"
                                    >
                                        <ListTodo className="mr-2 h-4 w-4" />
                                        Review Sessions
                                    </TabsTrigger>
                                </TabsList>

                                <div className="relative">
                                    <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-6 bg-gradient-to-b from-zinc-900/95 to-transparent" />

                                    {/* CHANGE: Increased max-height to show full chart prominently */}
                                    <div
                                        className="max-h-[calc(85vh-120px)] overflow-y-auto scroll-smooth px-1"
                                        style={{
                                            scrollbarWidth: 'thin',
                                            scrollbarColor: '#52525b #181818',
                                        }}
                                    >
                                        <TabsContent
                                            value="analytics"
                                            className="space-y-6 pb-4"
                                        >
                                            <div className="flex items-center justify-center gap-4">
                                                <button
                                                    onClick={() =>
                                                        setAnalyticsPeriod(
                                                            'today',
                                                        )
                                                    }
                                                    className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                                                        analyticsPeriod ===
                                                        'today'
                                                            ? 'scale-105 bg-white text-black shadow-xl shadow-white/20'
                                                            : 'border border-zinc-700/50 bg-zinc-800/80 text-white/80 shadow-lg shadow-black/20 hover:scale-105 hover:bg-zinc-700/80 hover:text-white'
                                                    }`}
                                                >
                                                    Today
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setAnalyticsPeriod(
                                                            'week',
                                                        )
                                                    }
                                                    className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                                                        analyticsPeriod ===
                                                        'week'
                                                            ? 'scale-105 bg-white text-black shadow-xl shadow-white/20'
                                                            : 'border border-zinc-700/50 bg-zinc-800/80 text-white/80 shadow-lg shadow-black/20 hover:scale-105 hover:bg-zinc-700/80 hover:text-white'
                                                    }`}
                                                >
                                                    This week 📅
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setAnalyticsPeriod(
                                                            'month',
                                                        )
                                                    }
                                                    className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                                                        analyticsPeriod ===
                                                        'month'
                                                            ? 'scale-105 bg-white text-black shadow-xl shadow-white/20'
                                                            : 'border border-zinc-700/50 bg-zinc-800/80 text-white/80 shadow-lg shadow-black/20 hover:scale-105 hover:bg-zinc-700/80 hover:text-white'
                                                    }`}
                                                >
                                                    This month 📅
                                                </button>
                                            </div>

                                            <div className="mb-8 overflow-hidden rounded-2xl border border-zinc-700/40 bg-zinc-800/60 p-6 shadow-xl shadow-black/20 backdrop-blur-md">
                                                <div className="mb-6 flex items-center justify-between">
                                                    <button
                                                        onClick={() =>
                                                            navigateAnalyticsDate(
                                                                'prev',
                                                            )
                                                        }
                                                        className="rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-2.5 shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:scale-110 hover:bg-zinc-700/80"
                                                    >
                                                        <ChevronLeft className="h-5 w-5" />
                                                    </button>
                                                    <div className="text-center">
                                                        <span className="text-base font-bold">
                                                            {formatAnalyticsDate(
                                                                analyticsDate,
                                                            )}
                                                        </span>
                                                        <div className="mt-1">
                                                            <span className="text-sm text-white/60">
                                                                Total Time:{' '}
                                                            </span>
                                                            <span className="text-sm font-bold">
                                                                0h 0m
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            navigateAnalyticsDate(
                                                                'next',
                                                            )
                                                        }
                                                        className="rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-2.5 shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:scale-110 hover:bg-zinc-700/80"
                                                    >
                                                        <ChevronRight className="h-5 w-5" />
                                                    </button>
                                                </div>

                                                {/* CHANGE: Increased chart height from 300px to 420px for full visibility */}
                                                <div className="relative h-[420px] overflow-hidden">
                                                    <ChartContainer
                                                        config={{
                                                            minutes: {
                                                                label: 'Minutes',
                                                                color: 'hsl(var(--chart-1))',
                                                            },
                                                        }}
                                                    >
                                                        <ResponsiveContainer
                                                            width="100%"
                                                            height="100%"
                                                        >
                                                            <AreaChart
                                                                data={
                                                                    mockAnalyticsData
                                                                }
                                                            >
                                                                <defs>
                                                                    <linearGradient
                                                                        id="colorMinutes"
                                                                        x1="0"
                                                                        y1="0"
                                                                        x2="0"
                                                                        y2="1"
                                                                    >
                                                                        <stop
                                                                            offset="5%"
                                                                            stopColor="#3b82f6"
                                                                            stopOpacity={
                                                                                0.3
                                                                            }
                                                                        />
                                                                        <stop
                                                                            offset="95%"
                                                                            stopColor="#3b82f6"
                                                                            stopOpacity={
                                                                                0
                                                                            }
                                                                        />
                                                                    </linearGradient>
                                                                </defs>
                                                                <CartesianGrid
                                                                    strokeDasharray="3 3"
                                                                    stroke="#52525b"
                                                                    opacity={
                                                                        0.3
                                                                    }
                                                                />
                                                                <XAxis
                                                                    dataKey="time"
                                                                    stroke="#a1a1aa"
                                                                    fontSize={
                                                                        12
                                                                    }
                                                                />
                                                                <YAxis
                                                                    stroke="#a1a1aa"
                                                                    fontSize={
                                                                        12
                                                                    }
                                                                />
                                                                <ChartTooltip
                                                                    content={
                                                                        <ChartTooltipContent />
                                                                    }
                                                                />
                                                                <Area
                                                                    type="monotone"
                                                                    dataKey="minutes"
                                                                    stroke="#3b82f6"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    fillOpacity={
                                                                        1
                                                                    }
                                                                    fill="url(#colorMinutes)"
                                                                />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </ChartContainer>
                                                </div>
                                            </div>

                                            <div className="mt-8 grid grid-cols-3 gap-4">
                                                <div className="rounded-2xl border border-zinc-700/40 bg-zinc-800/60 p-6 shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-800/80">
                                                    <div className="mb-3 flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-600/50 bg-zinc-700/80">
                                                            <BarChart3 className="h-5 w-5 text-white" />
                                                        </div>
                                                        <span className="text-sm font-medium text-white/70">
                                                            Total Sessions
                                                        </span>
                                                    </div>
                                                    <p className="text-4xl font-bold">
                                                        {
                                                            mockStats.totalSessions
                                                        }
                                                    </p>
                                                </div>

                                                <div className="rounded-2xl border border-zinc-700/40 bg-zinc-800/60 p-6 shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-800/80">
                                                    <div className="mb-3 flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-600/50 bg-zinc-700/80">
                                                            <Clock className="h-5 w-5 text-white" />
                                                        </div>
                                                        <span className="text-sm font-medium text-white/70">
                                                            Focused Time
                                                        </span>
                                                    </div>
                                                    <p className="text-4xl font-bold">
                                                        {mockStats.focusedTime}
                                                    </p>
                                                </div>

                                                <div className="rounded-2xl border border-zinc-700/40 bg-zinc-800/60 p-6 shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-800/80">
                                                    <div className="mb-3 flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-600/50 bg-zinc-700/80">
                                                            <Flame className="h-5 w-5 text-white" />
                                                        </div>
                                                        <span className="text-sm font-medium text-white/70">
                                                            Best Sessions
                                                        </span>
                                                    </div>
                                                    <p className="text-4xl font-bold">
                                                        {mockStats.bestSessions}
                                                    </p>
                                                </div>

                                                <div className="rounded-2xl border border-zinc-700/40 bg-zinc-800/60 p-6 shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-800/80">
                                                    <div className="mb-3 flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-600/50 bg-zinc-700/80">
                                                            <CheckCircle2 className="h-5 w-5 text-white" />
                                                        </div>
                                                        <span className="text-sm font-medium text-white/70">
                                                            Tasks completed
                                                        </span>
                                                    </div>
                                                    <p className="text-4xl font-bold">
                                                        {
                                                            mockStats.tasksCompleted
                                                        }
                                                    </p>
                                                </div>

                                                <div className="col-span-2 rounded-2xl border border-zinc-700/40 bg-zinc-800/60 p-6 shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-800/80">
                                                    <div className="mb-3 flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-600/50 bg-zinc-700/80">
                                                            <Atom className="h-5 w-5 text-white" />
                                                        </div>
                                                        <span className="text-sm font-medium text-white/70">
                                                            Focus Score
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <p className="text-4xl font-bold">
                                                            {
                                                                mockStats.focusScore
                                                            }
                                                        </p>
                                                        <div className="flex gap-1">
                                                            {[
                                                                1, 2, 3, 4, 5,
                                                            ].map((star) => (
                                                                <div
                                                                    key={star}
                                                                    className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white/30"
                                                                >
                                                                    <div className="h-3 w-3 rounded-full bg-white/20" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent
                                            value="sessions"
                                            className="space-y-4 pb-4"
                                        >
                                            <div className="space-y-3">
                                                <div className="rounded-2xl border border-zinc-700/40 bg-zinc-800/60 p-5 shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:scale-[1.02] hover:bg-zinc-800/80">
                                                    <div className="mb-3 flex items-start justify-between">
                                                        <div>
                                                            <h3 className="mb-1 text-lg font-bold text-white">
                                                                Morning Study
                                                                Session
                                                            </h3>
                                                            <p className="text-sm text-white/60">
                                                                Today, 9:00 AM -
                                                                10:25 AM
                                                            </p>
                                                        </div>
                                                        <div className="rounded-xl border border-green-500/30 bg-green-500/20 px-3 py-1">
                                                            <span className="text-sm font-semibold text-green-400">
                                                                Completed
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-white/70" />
                                                            <span className="text-white/80">
                                                                1h 25m
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-white/70" />
                                                            <span className="text-white/80">
                                                                3 tasks
                                                                completed
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Flame className="h-4 w-4 text-white/70" />
                                                            <span className="text-white/80">
                                                                4 Pomodoros
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="rounded-2xl border border-zinc-700/40 bg-zinc-800/60 p-5 shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:scale-[1.02] hover:bg-zinc-800/80">
                                                    <div className="mb-3 flex items-start justify-between">
                                                        <div>
                                                            <h3 className="mb-1 text-lg font-bold text-white">
                                                                Afternoon Focus
                                                            </h3>
                                                            <p className="text-sm text-white/60">
                                                                Yesterday, 2:00
                                                                PM - 3:50 PM
                                                            </p>
                                                        </div>
                                                        <div className="rounded-xl border border-green-500/30 bg-green-500/20 px-3 py-1">
                                                            <span className="text-sm font-semibold text-green-400">
                                                                Completed
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-white/70" />
                                                            <span className="text-white/80">
                                                                1h 50m
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-white/70" />
                                                            <span className="text-white/80">
                                                                5 tasks
                                                                completed
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Flame className="h-4 w-4 text-white/70" />
                                                            <span className="text-white/80">
                                                                4 Pomodoros
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="rounded-2xl border border-zinc-700/40 bg-zinc-800/60 p-5 shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:scale-[1.02] hover:bg-zinc-800/80">
                                                    <div className="mb-3 flex items-start justify-between">
                                                        <div>
                                                            <h3 className="mb-1 text-lg font-bold text-white">
                                                                Evening Review
                                                            </h3>
                                                            <p className="text-sm text-white/60">
                                                                Yesterday, 7:30
                                                                PM - 8:15 PM
                                                            </p>
                                                        </div>
                                                        <div className="rounded-xl border border-green-500/30 bg-green-500/20 px-3 py-1">
                                                            <span className="text-sm font-semibold text-green-400">
                                                                Completed
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-white/70" />
                                                            <span className="text-white/80">
                                                                45m
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-white/70" />
                                                            <span className="text-white/80">
                                                                2 tasks
                                                                completed
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Flame className="h-4 w-4 text-white/70" />
                                                            <span className="text-white/80">
                                                                2 Pomodoros
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="rounded-2xl border border-zinc-700/40 bg-zinc-800/60 p-5 shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:scale-[1.02] hover:bg-zinc-800/80">
                                                    <div className="mb-3 flex items-start justify-between">
                                                        <div>
                                                            <h3 className="mb-1 text-lg font-bold text-white">
                                                                Quick Study
                                                                Break
                                                            </h3>
                                                            <p className="text-sm text-white/60">
                                                                2 days ago,
                                                                11:00 AM - 11:30
                                                                AM
                                                            </p>
                                                        </div>
                                                        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/20 px-3 py-1">
                                                            <span className="text-sm font-semibold text-yellow-400">
                                                                Partial
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-white/70" />
                                                            <span className="text-white/80">
                                                                30m
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-white/70" />
                                                            <span className="text-white/80">
                                                                1 task completed
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Flame className="h-4 w-4 text-white/70" />
                                                            <span className="text-white/80">
                                                                1 Pomodoro
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </div>

                                    <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-6 bg-gradient-to-t from-zinc-900/95 to-transparent" />
                                </div>
                            </Tabs>
                        </div>
                    </motion.div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function AIChatDisplay() {
    const [chatTab, setChatTab] = useState<'writing' | 'speaking'>('writing');
    const [message, setMessage] = useState('');
    const [isMuted, setIsMuted] = useState(false);

    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center justify-between p-6">
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700/50 bg-zinc-800/80 shadow-lg shadow-black/20 backdrop-blur-md">
                        <Zap className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-xl font-semibold text-white drop-shadow-lg">
                        AI Assistant
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border-2 border-zinc-700/50 shadow-lg shadow-black/20">
                        <AvatarFallback className="bg-zinc-800/80 text-white backdrop-blur-md">
                            ND
                        </AvatarFallback>
                    </Avatar>
                </div>
            </header>

            <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-24">
                <div className="w-full max-w-4xl rounded-2xl border border-zinc-700/50 bg-zinc-800/80 p-6 shadow-xl shadow-black/20 backdrop-blur-md">
                    <Tabs
                        value={chatTab}
                        onValueChange={(v) =>
                            setChatTab(v as 'writing' | 'speaking')
                        }
                    >
                        <TabsList className="mb-6 grid w-full grid-cols-2 border border-zinc-700/30 bg-zinc-900/50">
                            <TabsTrigger
                                value="writing"
                                className="data-[state=active]:bg-zinc-700/80 data-[state=active]:text-white"
                            >
                                <span className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Writing AI
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="speaking"
                                className="data-[state=active]:bg-zinc-700/80 data-[state=active]:text-white"
                            >
                                <span className="flex items-center gap-2">
                                    <Mic className="h-4 w-4" />
                                    Speaking AI
                                </span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="writing" className="space-y-4">
                            <div className="h-[400px] space-y-4 overflow-y-auto rounded-xl border border-zinc-700/30 bg-zinc-900/50 p-4">
                                <div className="flex gap-3">
                                    <Avatar className="h-8 w-8 border border-zinc-700/50">
                                        <AvatarFallback className="bg-zinc-700/80 text-xs text-white">
                                            AI
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-3 shadow-md shadow-black/10 backdrop-blur-md">
                                        <p className="text-sm text-white">
                                            Hello! I'm your AI study assistant.
                                            How can I help you today?
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    placeholder="Type your message..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="flex-1 border-zinc-700/50 bg-zinc-900/50 text-white placeholder:text-white/50"
                                />
                                <Button className="rounded-xl bg-white text-black shadow-lg shadow-black/20 hover:bg-white/90">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="speaking" className="space-y-4">
                            <div className="flex h-[400px] flex-col items-center justify-center gap-6 rounded-xl border border-zinc-700/30 bg-zinc-900/50 p-4">
                                <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-zinc-700/50 bg-zinc-800/80 shadow-xl shadow-black/20 backdrop-blur-md">
                                    {isMuted ? (
                                        <MicOff className="h-16 w-16 text-white/70" />
                                    ) : (
                                        <Mic className="h-16 w-16 text-white" />
                                    )}
                                </div>
                                <p className="text-center text-white/70">
                                    {isMuted
                                        ? 'Click the microphone to start speaking'
                                        : 'Listening...'}
                                </p>
                                <Button
                                    onClick={() => setIsMuted(!isMuted)}
                                    className={`rounded-xl px-8 shadow-lg shadow-black/20 ${
                                        isMuted
                                            ? 'bg-white text-black hover:bg-white/90'
                                            : 'bg-red-500 text-white hover:bg-red-600'
                                    }`}
                                >
                                    {isMuted ? 'Start Speaking' : 'Stop'}
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}

function RoomDisplay() {
    const [roomMessage, setRoomMessage] = useState('');
    const [isMicOn, setIsMicOn] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(false);

    const mockUsers = [
        { id: 1, name: 'Nam Dang', avatar: 'ND', status: 'online' },
        { id: 2, name: 'John Doe', avatar: 'JD', status: 'online' },
        { id: 3, name: 'Jane Smith', avatar: 'JS', status: 'away' },
        { id: 4, name: 'Mike Wilson', avatar: 'MW', status: 'online' },
    ];

    return (
        <div className="flex h-full">
            {/* Main chat area */}
            <div className="flex flex-1 flex-col">
                <header className="flex items-center justify-between border-b border-zinc-700/50 p-6">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700/50 bg-zinc-800/80 shadow-lg shadow-black/20 backdrop-blur-md">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-xl font-semibold text-white drop-shadow-lg">
                            Study Room Chat
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsMicOn(!isMicOn)}
                            className={`rounded-xl border border-zinc-700/50 p-3 shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:scale-105 ${
                                isMicOn
                                    ? 'bg-green-500/80'
                                    : 'bg-zinc-800/80 hover:bg-zinc-700/80'
                            }`}
                        >
                            {isMicOn ? (
                                <Mic className="h-5 w-5 text-white" />
                            ) : (
                                <MicOff className="h-5 w-5 text-white" />
                            )}
                        </button>
                        <button
                            onClick={() => setIsVideoOn(!isVideoOn)}
                            className={`rounded-xl border border-zinc-700/50 p-3 shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:scale-105 ${
                                isVideoOn
                                    ? 'bg-green-500/80'
                                    : 'bg-zinc-800/80 hover:bg-zinc-700/80'
                            }`}
                        >
                            {isVideoOn ? (
                                <Video className="h-5 w-5 text-white" />
                            ) : (
                                <VideoOff className="h-5 w-5 text-white" />
                            )}
                        </button>
                        <button className="rounded-xl border border-red-400/50 bg-red-500/80 p-3 shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-red-600/80">
                            <Phone className="h-5 w-5 text-white" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 space-y-4 overflow-y-auto p-6">
                    <div className="flex gap-3">
                        <Avatar className="h-10 w-10 border-2 border-zinc-700/50 shadow-lg shadow-black/20">
                            <AvatarFallback className="bg-zinc-800/80 text-white backdrop-blur-md">
                                JD
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">
                                    John Doe
                                </span>
                                <span className="text-xs text-white/50">
                                    10:30 AM
                                </span>
                            </div>
                            <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-3 shadow-md shadow-black/10 backdrop-blur-md">
                                <p className="text-sm text-white">
                                    Hey everyone! Ready for the study session?
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Avatar className="h-10 w-10 border-2 border-zinc-700/50 shadow-lg shadow-black/20">
                            <AvatarFallback className="bg-zinc-800/80 text-white backdrop-blur-md">
                                JS
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">
                                    Jane Smith
                                </span>
                                <span className="text-xs text-white/50">
                                    10:32 AM
                                </span>
                            </div>
                            <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-3 shadow-md shadow-black/10 backdrop-blur-md">
                                <p className="text-sm text-white">
                                    Yes! Let's focus on the math assignment
                                    today.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="border-t border-zinc-700/50 p-6">
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            placeholder="Type a message..."
                            value={roomMessage}
                            onChange={(e) => setRoomMessage(e.target.value)}
                            className="flex-1 rounded-xl border-zinc-700/50 bg-zinc-800/80 text-white placeholder:text-white/50"
                        />
                        <Button className="rounded-xl bg-white text-black shadow-lg shadow-black/20 hover:bg-white/90">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </footer>
            </div>

            {/* User sidebar */}
            <div className="w-64 border-l border-zinc-700/50 bg-zinc-900/50 p-4 backdrop-blur-md">
                <h2 className="mb-4 text-sm font-semibold text-white/70">
                    MEMBERS — {mockUsers.length}
                </h2>
                <div className="space-y-2">
                    {mockUsers.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center gap-3 rounded-xl border border-zinc-700/30 bg-zinc-800/50 p-3 shadow-md shadow-black/10 backdrop-blur-md transition-all hover:bg-zinc-700/50"
                        >
                            <div className="relative">
                                <Avatar className="h-8 w-8 border border-zinc-700/50">
                                    <AvatarFallback className="bg-zinc-700/80 text-xs text-white">
                                        {user.avatar}
                                    </AvatarFallback>
                                </Avatar>
                                <div
                                    className={`absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-zinc-900 ${
                                        user.status === 'online'
                                            ? 'bg-green-500'
                                            : 'bg-yellow-500'
                                    }`}
                                />
                            </div>
                            <span className="text-sm text-white">
                                {user.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function CollaborationDisplay() {
    const [isMicOn, setIsMicOn] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [focusedParticipantId, setFocusedParticipantId] = useState<
        number | null
    >(null);

    const participants = [
        { id: 1, name: 'You', avatar: 'YO', isVideoOn: true, isMicOn: true },
        {
            id: 2,
            name: 'Nam Dang',
            avatar: 'ND',
            isVideoOn: true,
            isMicOn: true,
        },
        {
            id: 3,
            name: 'John Doe',
            avatar: 'JD',
            isVideoOn: false,
            isMicOn: true,
        },
        {
            id: 4,
            name: 'Jane Smith',
            avatar: 'JS',
            isVideoOn: true,
            isMicOn: false,
        },
        {
            id: 5,
            name: 'Alex Chen',
            avatar: 'AC',
            isVideoOn: true,
            isMicOn: true,
        },
        {
            id: 6,
            name: 'Sarah Lee',
            avatar: 'SL',
            isVideoOn: true,
            isMicOn: true,
        },
    ];

    const focusedParticipant = participants.find(
        (p) => p.id === focusedParticipantId,
    );
    const otherParticipants = participants.filter(
        (p) => p.id !== focusedParticipantId,
    );

    const handleParticipantClick = (participantId: number) => {
        if (focusedParticipantId === participantId) {
            setFocusedParticipantId(null); // Exit spotlight mode
        } else {
            setFocusedParticipantId(participantId); // Enter spotlight mode
        }
    };

    return (
        <div className="flex h-full flex-col gap-6 p-6">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700/50 bg-zinc-800/80 shadow-lg shadow-black/20 backdrop-blur-md">
                        <MonitorPlay className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white drop-shadow-lg">
                            Collaboration Room
                        </h1>
                        <p className="text-sm text-white/60">
                            {participants.length} participants
                        </p>
                    </div>
                </div>
            </header>

            {focusedParticipant ? (
                // Spotlight View: Large focused participant + small thumbnails
                <div className="flex flex-1 flex-col gap-4">
                    {/* Large focused participant */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative flex-1 cursor-pointer overflow-hidden rounded-2xl border border-zinc-700/50 bg-zinc-800/80 shadow-xl shadow-black/20 backdrop-blur-md"
                        onClick={() =>
                            handleParticipantClick(focusedParticipant.id)
                        }
                    >
                        {focusedParticipant.isVideoOn ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-700/50 to-zinc-900/50">
                                <div className="text-9xl font-bold text-white/20">
                                    {focusedParticipant.avatar}
                                </div>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-zinc-600/50 bg-zinc-700/80">
                                        <span className="text-5xl font-bold text-white">
                                            {focusedParticipant.avatar}
                                        </span>
                                    </div>
                                    <VideoOff className="h-8 w-8 text-white/50" />
                                </div>
                            </div>
                        )}

                        {/* Participant info overlay */}
                        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-white drop-shadow-lg">
                                    {focusedParticipant.name}
                                </span>
                                <div className="flex items-center gap-2">
                                    {focusedParticipant.isMicOn ? (
                                        <div className="rounded-lg bg-green-500/80 p-2 backdrop-blur-md">
                                            <Mic className="h-4 w-4 text-white" />
                                        </div>
                                    ) : (
                                        <div className="rounded-lg bg-red-500/80 p-2 backdrop-blur-md">
                                            <MicOff className="h-4 w-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Click hint overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors group-hover:bg-black/10 group-hover:opacity-100">
                            <div className="rounded-full border border-white/20 bg-black/60 px-4 py-2 backdrop-blur-md">
                                <span className="text-sm text-white">
                                    Click to exit spotlight
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Small thumbnails of other participants */}
                    <div className="grid h-32 grid-cols-5 gap-3">
                        {otherParticipants.map((participant, index) => (
                            <motion.div
                                key={participant.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative cursor-pointer overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-800/80 shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:border-zinc-500/50"
                                onClick={() =>
                                    handleParticipantClick(participant.id)
                                }
                            >
                                {participant.isVideoOn ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-700/50 to-zinc-900/50">
                                        <div className="text-2xl font-bold text-white/20">
                                            {participant.avatar}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-600/50 bg-zinc-700/80">
                                                <span className="text-xs font-bold text-white">
                                                    {participant.avatar}
                                                </span>
                                            </div>
                                            <VideoOff className="h-3 w-3 text-white/50" />
                                        </div>
                                    </div>
                                )}

                                {/* Participant info overlay */}
                                <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                    <div className="flex items-center justify-between">
                                        <span className="truncate text-xs font-semibold text-white drop-shadow-lg">
                                            {participant.name}
                                        </span>
                                        {participant.isMicOn ? (
                                            <div className="rounded bg-green-500/80 p-0.5 backdrop-blur-md">
                                                <Mic className="h-2 w-2 text-white" />
                                            </div>
                                        ) : (
                                            <div className="rounded bg-red-500/80 p-0.5 backdrop-blur-md">
                                                <MicOff className="h-2 w-2 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Hover hint */}
                                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            ) : (
                // Grid View: All participants equal size
                <div className="grid flex-1 grid-cols-3 gap-4">
                    {participants.map((participant, index) => (
                        <motion.div
                            key={participant.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative aspect-video cursor-pointer overflow-hidden rounded-2xl border border-zinc-700/50 bg-zinc-800/80 shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:border-zinc-500/50"
                            onClick={() =>
                                handleParticipantClick(participant.id)
                            }
                        >
                            {participant.isVideoOn ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-700/50 to-zinc-900/50">
                                    <div className="text-6xl font-bold text-white/20">
                                        {participant.avatar}
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-zinc-600/50 bg-zinc-700/80">
                                            <span className="text-2xl font-bold text-white">
                                                {participant.avatar}
                                            </span>
                                        </div>
                                        <VideoOff className="h-6 w-6 text-white/50" />
                                    </div>
                                </div>
                            )}

                            {/* Participant info overlay */}
                            <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-white drop-shadow-lg">
                                        {participant.name}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {participant.isMicOn ? (
                                            <div className="rounded-lg bg-green-500/80 p-1.5 backdrop-blur-md">
                                                <Mic className="h-3 w-3 text-white" />
                                            </div>
                                        ) : (
                                            <div className="rounded-lg bg-red-500/80 p-1.5 backdrop-blur-md">
                                                <MicOff className="h-3 w-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Hover hint */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors group-hover:bg-black/10 group-hover:opacity-100">
                                <div className="rounded-full border border-white/20 bg-black/60 px-3 py-1.5 backdrop-blur-md">
                                    <span className="text-xs text-white">
                                        Click to spotlight
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <footer className="flex items-center justify-center gap-4">
                <button
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`group relative rounded-2xl border p-4 backdrop-blur-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                        isMicOn
                            ? 'border-zinc-600/50 bg-zinc-800/90 shadow-lg shadow-zinc-500/20 hover:bg-zinc-700/90 hover:shadow-zinc-400/30'
                            : 'border-red-400/50 bg-red-500/90 shadow-lg shadow-red-500/30 hover:bg-red-600/90 hover:shadow-red-400/50'
                    }`}
                >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    {isMicOn ? (
                        <Mic className="relative z-10 h-6 w-6 text-white" />
                    ) : (
                        <MicOff className="relative z-10 h-6 w-6 text-white" />
                    )}
                </button>

                <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`group relative rounded-2xl border p-4 backdrop-blur-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                        isVideoOn
                            ? 'border-zinc-600/50 bg-zinc-800/90 shadow-lg shadow-zinc-500/20 hover:bg-zinc-700/90 hover:shadow-zinc-400/30'
                            : 'border-red-400/50 bg-red-500/90 shadow-lg shadow-red-500/30 hover:bg-red-600/90 hover:shadow-red-400/50'
                    }`}
                >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    {isVideoOn ? (
                        <Video className="relative z-10 h-6 w-6 text-white" />
                    ) : (
                        <VideoOff className="relative z-10 h-6 w-6 text-white" />
                    )}
                </button>

                <button
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    className={`group relative rounded-2xl border p-4 backdrop-blur-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                        isScreenSharing
                            ? 'border-green-400/50 bg-green-500/90 shadow-lg shadow-green-500/30 hover:bg-green-600/90 hover:shadow-green-400/50'
                            : 'border-zinc-600/50 bg-zinc-800/90 shadow-lg shadow-zinc-500/20 hover:bg-zinc-700/90 hover:shadow-zinc-400/30'
                    }`}
                >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <MonitorPlay className="relative z-10 h-6 w-6 text-white" />
                </button>

                <button className="group relative rounded-2xl border border-red-400/50 bg-red-500/90 p-4 shadow-lg shadow-red-500/30 backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:bg-red-600/90 hover:shadow-red-400/50 active:scale-95">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <PhoneOff className="relative z-10 h-6 w-6 text-white" />
                </button>
            </footer>
        </div>
    );
}
