'use client';

import type React from 'react';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    Clock,
    Video,
    Zap,
    MessageSquare,
    Mic,
    MicOff,
    VideoOff,
    MonitorPlay,
    PhoneOff,
    DoorOpen,
    Users,
    KeyRound,
} from 'lucide-react';
import { Task, AmbientSound } from '@/lib/api/dto/room';
import {
    BACKGROUND_IMAGES,
    POMODORO_PRESETS,
    AMBIENT_SOUNDS,
} from './page.data';
import { PomodoroDisplay } from './pomodoro';
import { AIChatDisplay } from './ai-learning-chat';
import { ChattingRoomDisplay } from './chatting-room';
import { useParams } from 'next/navigation';
import { useGetRoomById } from '@/lib/service/room';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export interface FlyingTask {
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

export type TimePeriod = 'daily' | 'weekly' | 'monthly';

export type DisplayMode = 'pomodoro' | 'ai-chat' | 'room' | 'collaboration';

export default function RoomPage() {
    const { id } = useParams();
    const { data: room, isLoading, isFetching } = useGetRoomById(id as string);
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

    const [displayMode, setDisplayMode] = useState<DisplayMode>('pomodoro');

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

    const handlePomodoroComplete = useCallback(() => {
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
    }, [
        isPomodoroMode,
        selectedPreset,
        customSettings,
        sessionType,
        pomodoroSession,
    ]);

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
    }, [isActive, minutes, seconds, isPomodoroMode, handlePomodoroComplete]);

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

    if (isLoading || isFetching)
        return (
            <LoadingSpinner
                size="lg"
                className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2"
            />
        );

    if (!room)
        return (
            <div className="flex h-screen w-full items-center justify-center px-4">
                <EmptyState
                    title="Room Not Found"
                    description="We couldn’t find the room you’re looking for. It may have been deleted or is private."
                    icons={[DoorOpen, Users, KeyRound]}
                    action={{
                        label: 'Back to Rooms',
                        onClick: () => (window.location.href = '/rooms'),
                    }}
                    className="max-w-md border-zinc-700/50 bg-transparent text-white"
                />
            </div>
        );

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
                                showAnalytics={showAnalytics}
                                setShowAnalytics={setShowAnalytics}
                                analyticsPeriod={analyticsPeriod}
                                setAnalyticsPeriod={setAnalyticsPeriod}
                                analyticsDate={analyticsDate}
                                formatAnalyticsDate={formatAnalyticsDate}
                                navigateAnalyticsDate={navigateAnalyticsDate}
                            />
                        </motion.div>
                    )}

                    {displayMode === 'ai-chat' && (
                        <motion.div
                            key="ai-chat"
                            initial={{ x: 0, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 0, opacity: 0 }}
                            transition={{
                                duration: 0.5,
                                ease: [0.4, 0.2, 1, 1],
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
                            <ChattingRoomDisplay />
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
